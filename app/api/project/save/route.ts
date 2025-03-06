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
      width: number;
      height: number;
      components: {
        id?: number;
        type: string;
        width: number;
        height: number;
        props: Record<string, unknown>;
        fileIndex?: number;
      }[];
    }[];
  };
  userId: number;
  name: string;
  description?: string;
}

const ensureUploadDir = async () => {
  const uploadDir = path.join(process.cwd(), "public/uploads");
  try {
    await fs.access(uploadDir, fs.constants.W_OK);
    console.log("上传目录存在且可写:", uploadDir);
  } catch (error) {
    console.log("创建上传目录:", uploadDir);
    await fs.mkdir(uploadDir, { recursive: true });
  }
};

export async function POST(req: NextRequest) {
  try {
    await ensureUploadDir();

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      console.error("未提供令牌");
      return NextResponse.json({ message: "未提供令牌" }, { status: 401 });
    }

    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      console.log("JWT 验证成功:", decoded);
    } catch (error) {
      console.error("JWT 验证失败:", {
        message: (error as Error).message,
        stack: (error as Error).stack,
      });
      return NextResponse.json({ message: "令牌无效" }, { status: 401 });
    }

    const formData = await req.formData();
    const projectDataRaw = formData.get("projectData");
    if (!projectDataRaw || typeof projectDataRaw !== "string") {
      console.error("projectData 无效:", { projectDataRaw });
      return NextResponse.json({ message: "缺少或无效的 projectData" }, { status: 400 });
    }

    const projectData: ProjectData = JSON.parse(projectDataRaw);
    const { project, userId, name, description } = projectData;

    const decodedUserId = Number(decoded.userId);
    if (userId !== decodedUserId) {
      console.error("用户 ID 不匹配:", { userId, decodedUserId });
      return NextResponse.json({ message: "用户 ID 不匹配" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decodedUserId },
    });
    if (!user) {
      console.error("无效的用户 ID:", decodedUserId);
      return NextResponse.json({ message: "无效的用户 ID" }, { status: 400 });
    }

    const layout = await prisma.layout.create({
      data: {
        userId: decodedUserId,
        name,
        description,
      },
    });
    console.log("Layout 创建成功:", layout);

    const baseUrl = "http://localhost:3000";

    const savedBoxes = await Promise.all(
      project.boxes.map(async (box) => {
        const savedBox = await prisma.box.create({
          data: {
            layoutId: layout.id,
            positionX: box.positionX,
            positionY: box.positionY,
            width: box.width,
            height: box.height,
          },
        });
        console.log("Box 创建成功:", savedBox);

        const savedComponents = await Promise.all(
          box.components.map(async (comp) => {
            let imageId: number | undefined;
            let imageUrl: string | undefined;

            if (comp.fileIndex !== undefined) {
              const fileKey = `image-${box.id}-${comp.fileIndex}`;
              const file = formData.get(fileKey);
              console.log("处理图片:", { fileKey, file });

              if (file instanceof Blob) {
                const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.name || "unknown.jpg"}`;
                const filePath = path.join(process.cwd(), "public/uploads", fileName);
                try {
                  const buffer = Buffer.from(await file.arrayBuffer());
                  await fs.writeFile(filePath, buffer);
                  console.log("图片保存成功:", filePath);

                  imageUrl = `${baseUrl}/uploads/${fileName}`;
                  const image = await prisma.image.create({
                    data: {
                      path: imageUrl,
                      size: file.size,
                    },
                  });
                  imageId = image.id;
                  console.log("Image 记录创建成功:", image);
                } catch (error) {
                  console.error("保存图片失败:", {
                    fileKey,
                    fileName,
                    error: (error as Error).message,
                    stack: (error as Error).stack,
                  });
                }
              }
            }

            const updatedProps = {
              ...comp.props, // 保留前端发送的其他 props
              ...(imageUrl && { src: imageUrl }), // 添加图片 URL
            };

            const component = await prisma.component.create({
              data: {
                boxId: savedBox.id,
                type: comp.type,
                width: comp.width,
                height: comp.height,
                props: updatedProps, // 保存更新后的 props
                imageId,
              },
            });
            console.log("Component 创建成功:", component);

            return {
              id: component.id,
              type: component.type,
              width: component.width,
              height: component.height,
              props: updatedProps, // 返回更新后的 props
              imageId: component.imageId,
            };
          })
        );

        return {
          id: savedBox.id,
          positionX: savedBox.positionX,
          positionY: savedBox.positionY,
          width: savedBox.width,
          height: savedBox.height,
          components: savedComponents,
        };
      })
    );

    console.log("项目保存成功:", { layoutId: layout.id, boxes: savedBoxes });
    return NextResponse.json({ layoutId: layout.id, boxes: savedBoxes }, { status: 200 });
  } catch (error) {
    console.error("Save error details:", {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    return NextResponse.json(
      { message: "保存项目失败", error: (error as Error).message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}