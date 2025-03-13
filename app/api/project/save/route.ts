import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import path from "path";
import { promises as fs } from "fs";

const prisma = new PrismaClient();
const JWT_SECRET = "3f8e7d6c5b4a39281f0e1d2c3b4a5967d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2";

interface ProjectData {
  project: {
    boxes: {
      id: number;
      positionX: number;
      positionY: number;
      width: string;
      height?: number;
      order?: number;
      layout?: { columns: number };
      components: {
        id?: number;
        type: string;
        width: string;
        height: number;
        props: Record<string, unknown>;
        column?: number;
        fileIndex?: number;
      }[];
    }[];
  };
  userId: number;
  name: string;
  description?: string;
}

const ensureUploadDir = async (subDir: string = "") => {
  const uploadDir = path.join(process.cwd(), "public/uploads", subDir);
  try {
    await fs.access(uploadDir, fs.constants.W_OK);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
};

export async function POST(req: NextRequest) {
  try {
    await ensureUploadDir();
    await ensureUploadDir("previews");

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ message: "未提供令牌" }, { status: 401 });

    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
      return NextResponse.json({ message: "令牌无效" }, { status: 401 });
    }

    const formData = await req.formData();
    const projectDataRaw = formData.get("projectData");
    if (!projectDataRaw || typeof projectDataRaw !== "string") {
      return NextResponse.json({ message: "缺少或无效的 projectData" }, { status: 400 });
    }

    const projectData: ProjectData = JSON.parse(projectDataRaw);
    const { project, userId, name, description } = projectData;

    const decodedUserId = Number(decoded.userId);
    if (userId !== decodedUserId) {
      return NextResponse.json({ message: "用户 ID 不匹配" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id: decodedUserId } });
    if (!user) {
      return NextResponse.json({ message: "无效的用户 ID" }, { status: 400 });
    }

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    // 处理 preview 文件
    let previewPath = null;
    const previewFile = formData.get("preview");
    console.log("Received preview file:", previewFile); // 调试日志
    if (previewFile instanceof Blob) {
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-preview.png`;
      const filePath = path.join(process.cwd(), "public/uploads/previews", fileName);
      const buffer = Buffer.from(await previewFile.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      previewPath = `/uploads/previews/${fileName}`;
      console.log("Preview saved at:", previewPath); // 调试日志
    } else {
      console.warn("No preview file received in formData");
    }

    // 创建 Layout 记录
    const layout = await prisma.layout.create({
      data: {
        userId: decodedUserId,
        name,
        description,
        preview: previewPath,
      },
    });
    console.log("Layout created with preview:", layout.preview); // 调试日志

    const savedBoxes = [];
    for (let i = 0; i < project.boxes.length; i++) {
      const box = project.boxes[i];
      const savedBox = await prisma.box.create({
        data: {
          layoutId: layout.id,
          positionX: box.positionX,
          positionY: box.positionY,
          width: box.width,
          columns: box.layout?.columns || 1,
          sortOrder: box.sortOrder || i,
        },
      });

      const savedComponents = await Promise.all(
        box.components.map(async (comp, index) => {
          let imageId: number | undefined;
          let imageUrl: string | undefined;

          if (comp.fileIndex !== undefined) {
            const fileKey = `image-${box.id}-${comp.fileIndex}`;
            const file = formData.get(fileKey);
            if (file instanceof Blob) {
              const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.name || "unknown.jpg"}`;
              const filePath = path.join(process.cwd(), "public/uploads", fileName);
              const buffer = Buffer.from(await file.arrayBuffer());
              await fs.writeFile(filePath, buffer);
              imageUrl = `${baseUrl}/uploads/${fileName}`;
              const image = await prisma.image.create({
                data: { path: imageUrl, size: file.size },
              });
              imageId = image.id;
            }
          }

          const updatedProps = { ...comp.props, ...(imageUrl && { src: imageUrl }) };

          const component = await prisma.component.create({
            data: {
              boxId: savedBox.id,
              type: comp.type,
              width: comp.width,
              height: comp.height,
              props: updatedProps,
              imageId,
              columnIndex: comp.column || 0,
              sortOrder: index,
            },
          });

          return {
            id: component.id,
            type: component.type,
            width: component.width,
            height: component.height,
            props: updatedProps,
            imageId: component.imageId,
            column: comp.column,
          };
        })
      );

      savedBoxes.push({
        id: savedBox.id,
        positionX: box.positionX,
        positionY: box.positionY,
        width: box.width,
        order: box.sortOrder || i,
        layout: { columns: box.layout?.columns || 1 },
        height: box.height,
        components: savedComponents,
      });
    }

    return NextResponse.json({ layoutId: layout.id, boxes: savedBoxes }, { status: 200 });
  } catch (error) {
    console.error("Save error:", error);
    return NextResponse.json({ message: "保存项目失败", error: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}