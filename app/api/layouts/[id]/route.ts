import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs/promises";

const JWT_SECRET = process.env.JWT_SECRET || '3f8e7d6c5b4a39281f0e1d2c3b4a5967d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2';

async function ensureUploadDir() {
  const uploadDir = path.join(process.cwd(), "public/uploads");
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error("创建上传目录失败:", error);
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ message: "未授权" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const resolvedParams = await params; // 等待 params 解析
    const layoutId = parseInt(resolvedParams.id);

    if (isNaN(layoutId)) {
      return NextResponse.json({ message: "无效的项目 ID" }, { status: 400 });
    }

    const layout = await prisma.layout.findUnique({
      where: { id: layoutId, userId: decoded.userId },
      include: {
        boxes: {
          include: { components: true },
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
    return NextResponse.json({ message: "未授权" } as ErrorResponse, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const resolvedParams = await params; // 等待 params 解析
    const layoutId = parseInt(resolvedParams.id);

    if (isNaN(layoutId)) {
      return NextResponse.json({ message: "无效的项目 ID" } as ErrorResponse, { status: 400 });
    }

    const layout = await prisma.layout.findUnique({
      where: { id: layoutId },
      select: { userId: true },
    });

    if (!layout) {
      return NextResponse.json({ message: "项目不存在" } as ErrorResponse, { status: 404 });
    }

    if (layout.userId !== decoded.userId) {
      return NextResponse.json({ message: "无权删除此项目" } as ErrorResponse, { status: 403 });
    }

    await prisma.layout.delete({
      where: { id: layoutId },
    });

    return NextResponse.json({ message: "项目删除成功" }, { status: 200 });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: "无效的 token" } as ErrorResponse, { status: 401 });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ message: "token 已过期" } as ErrorResponse, { status: 401 });
    }

    console.error("删除项目失败:", error);
    return NextResponse.json({ message: "删除项目失败" } as ErrorResponse, { status: 500 });
  }
}
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ message: "未授权" } as ErrorResponse, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const layoutId = parseInt(params.id);
    if (isNaN(layoutId)) {
      return NextResponse.json({ message: "无效的项目 ID" } as ErrorResponse, { status: 400 });
    }

    await ensureUploadDir();

    const formData = await req.formData();
    const layoutDataRaw = formData.get("projectData");
    if (!layoutDataRaw || typeof layoutDataRaw !== "string") {
      console.error("projectData 无效:", { layoutDataRaw });
      return NextResponse.json({ message: "缺少或无效的 projectData" } as ErrorResponse, { status: 400 });
    }

    const layoutData = JSON.parse(layoutDataRaw);
    const { name, description, boxes } = layoutData;

    const layout = await prisma.layout.findUnique({
      where: { id: layoutId },
      select: { userId: true },
    });

    if (!layout || layout.userId !== decoded.userId) {
      return NextResponse.json({ message: "项目不存在或无权限" } as ErrorResponse, { status: 404 });
    }

    const baseUrl = "http://localhost:3000"; // 可改为环境变量

    // 更新 Layout 和 Boxes
    const updatedLayout = await prisma.layout.update({
      where: { id: layoutId },
      data: {
        name,
        description,
        boxes: {
          deleteMany: {}, // 删除旧 Boxes
          create: await Promise.all(
            boxes.map(async (box: any) => {
              const savedBox = {
                positionX: box.positionX,
                positionY: box.positionY,
                width: box.width,
                height: box.height,
                components: {
                  create: await Promise.all(
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
                            data: {
                              path: imageUrl,
                              size: file.size,
                            },
                          });
                          imageId = image.id;
                          console.log("Image 更新成功:", image);
                        }
                      }

                      const updatedProps = {
                        ...comp.props,
                        ...(imageUrl && { src: imageUrl }), // 更新 src
                      };

                      return {
                        type: comp.type,
                        width: comp.width,
                        height: comp.height,
                        props: updatedProps,
                        imageId,
                      };
                    })
                  ),
                },
              };
              return savedBox;
            })
          ),
        },
      },
      include: {
        boxes: {
          include: {
            components: true,
          },
        },
      },
    });

    const response: LayoutResponse = {
      id: updatedLayout.id,
      name: updatedLayout.name,
      description: updatedLayout.description,
      boxes: updatedLayout.boxes.map((box) => ({
        id: box.id,
        positionX: box.positionX,
        positionY: box.positionY,
        width: box.width,
        height: box.height,
        components: box.components.map((comp) => ({
          id: comp.id,
          type: comp.type,
          width: comp.width,
          height: comp.height,
          props: comp.props,
          imageId: comp.imageId,
        })),
      })),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("更新项目失败:", error);
    return NextResponse.json({ message: "服务器错误", details: error.message } as ErrorResponse, { status: 500 });
  }
}