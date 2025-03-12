import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs/promises";

const JWT_SECRET = process.env.JWT_SECRET || "3f8e7d6c5b4a39281f0e1d2c3b4a5967d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2";

async function ensureUploadDir() {
  const uploadDir = path.join(process.cwd(), "public/uploads");
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error("创建上传目录失败:", error);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ message: "未授权" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const layoutId = parseInt(params.id);
    if (isNaN(layoutId)) {
      return NextResponse.json({ message: "无效的项目 ID" }, { status: 400 });
    }

    await ensureUploadDir();

    const formData = await req.formData();
    const layoutDataRaw = formData.get("projectData");
    if (!layoutDataRaw || typeof layoutDataRaw !== "string") {
      return NextResponse.json({ message: "缺少或无效的 projectData" }, { status: 400 });
    }

    const layoutData = JSON.parse(layoutDataRaw);
    const { name, description, boxes } = layoutData;

    const layout = await prisma.layout.findUnique({
      where: { id: layoutId },
      select: { userId: true },
    });

    if (!layout || layout.userId !== decoded.userId) {
      return NextResponse.json({ message: "项目不存在或无权限" }, { status: 404 });
    }

    const baseUrl = "http://localhost:3000";

    // 先删除旧的 boxes
    await prisma.box.deleteMany({ where: { layoutId } });

    // 按顺序创建新 boxes
    const savedBoxes = [];
    for (const box of boxes) {
      const savedBox = await prisma.box.create({
        data: {
          layoutId,
          positionX: box.positionX,
          positionY: box.positionY,
          width: box.width,
        },
      });

      const savedComponents = await Promise.all(
        box.components.map(async (comp: any) => {
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
            },
          });

          return {
            id: component.id,
            type: comp.type,
            width: comp.width,
            height: comp.height,
            props: updatedProps,
            imageId: component.imageId,
          };
        })
      );

      savedBoxes.push({
        id: savedBox.id,
        positionX: savedBox.positionX,
        positionY: savedBox.positionY,
        width: savedBox.width,
        height: box.height, // 如果前端传了 height，这里使用
        components: savedComponents,
      });
    }

    const updatedLayout = await prisma.layout.update({
      where: { id: layoutId },
      data: { name, description },
    });

    const response = {
      id: updatedLayout.id,
      name: updatedLayout.name,
      description: updatedLayout.description,
      boxes: savedBoxes,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("更新项目失败:", error);
    return NextResponse.json({ message: "服务器错误", details: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ message: "未授权" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const resolvedParams = await params;
    const layoutId = parseInt(resolvedParams.id);

    if (isNaN(layoutId)) {
      return NextResponse.json({ message: "无效的项目 ID" }, { status: 400 });
    }

    const layout = await prisma.layout.findUnique({
      where: { id: layoutId, userId: decoded.userId },
      include: {
        boxes: {
          include: { components: true },
          orderBy: { id: "asc" }, // 可选：显式排序，如果不需要可移除
        },
      },
    });

    if (!layout) {
      return NextResponse.json({ message: "项目不存在" }, { status: 404 });
    }

    return NextResponse.json(layout, { status: 200 });
  } catch (error) {
    console.error("获取项目失败:", error);
    return NextResponse.json({ message: "服务器错误" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ message: "未授权" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const resolvedParams = await params;
    const layoutId = parseInt(resolvedParams.id);

    if (isNaN(layoutId)) {
      return NextResponse.json({ message: "无效的项目 ID" }, { status: 400 });
    }

    const layout = await prisma.layout.findUnique({
      where: { id: layoutId },
      select: { userId: true },
    });

    if (!layout || layout.userId !== decoded.userId) {
      return NextResponse.json({ message: "项目不存在或无权限" }, { status: 404 });
    }

    await prisma.layout.delete({
      where: { id: layoutId },
    });

    return NextResponse.json({ message: "项目删除成功" }, { status: 200 });
  } catch (error) {
    console.error("删除项目失败:", error);
    return NextResponse.json({ message: "服务器错误" }, { status: 500 });
  }
}