import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs/promises";
import { Prisma } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "3f8e7d6c5b4a39281f0e1d2c3b4a5967d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2";

interface ComponentData {
  id?: number;
  type: string;
  width: string;
  height: number;
  props: Record<string, unknown>;
  column?: number;
  fileIndex?: number;
}

interface BoxData {
  id?: number;
  positionX: number;
  positionY: number;
  width: string;
  layout?: {
    columns: number;
  };
  components: ComponentData[];
}

interface ProjectData {
  name: string;
  description?: string;
  boxes: BoxData[];
}

interface FormattedComponent {
  id: number;
  type: string;
  width: string;
  height: number;
  props: Record<string, unknown>;
  column?: number;
  file?: {
    path: string;
    size: number;
  };
}

interface FormattedBox {
  id: number;
  positionX: number;
  positionY: number;
  width: string;
  layout?: {
    columns: number;
  };
  components: FormattedComponent[];
}

interface FormattedLayout {
  id: number;
  name: string;
  description: string | null;
  boxes: FormattedBox[];
}

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
    const projectDataStr = formData.get("projectData");
    if (!projectDataStr || typeof projectDataStr !== "string") {
      return NextResponse.json({ message: "缺少或无效的 projectData" }, { status: 400 });
    }

    const projectData: { name: string; description: string | null; boxes: BoxData[] } = JSON.parse(projectDataStr);
    const { name, description, boxes } = projectData;

    console.log("[Debug] Received project data:", projectData);

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
    const savedBoxes = await Promise.all(
      boxes.map(async (box: BoxData, index: number) => {
        const savedBox = await prisma.box.create({
          data: {
            layoutId,
            positionX: box.positionX,
            positionY: box.positionY,
            width: box.width,
            columns: box.layout?.columns || 1,
            sortOrder: index, // 保存 box 的顺序
          },
        });

        const savedComponents = await Promise.all(
          box.components.map(async (comp: ComponentData, compIndex: number) => {
            let imageId: number | undefined;
            let imageUrl: string | undefined;

            if (comp.fileIndex !== undefined) {
              const fileKey = `image-${box.id || index}-${comp.fileIndex}`;
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

            const updatedProps = imageUrl ? { ...comp.props, src: imageUrl } : comp.props;

            const component = await prisma.component.create({
              data: {
                boxId: savedBox.id,
                type: comp.type,
                width: comp.width,
                height: comp.height,
                props: updatedProps as Prisma.JsonValue,
                columnIndex: comp.column || 0,
                sortOrder: compIndex, // 确保组件顺序
                imageId,
              },
            });

            return {
              id: component.id,
              type: component.type,
              width: component.width,
              height: component.height,
              props: component.props as Record<string, unknown>,
              column: component.columnIndex,
            };
          })
        );

        return {
          id: savedBox.id,
          positionX: savedBox.positionX,
          positionY: savedBox.positionY,
          width: savedBox.width,
          layout: {
            columns: box.layout?.columns || 1,
          },
          components: savedComponents,
        };
      })
    );

    const updatedLayout = await prisma.layout.update({
      where: { id: layoutId },
      data: { name, description },
      include: {
        boxes: {
          include: {
            components: true,
          },
        },
      },
    });

    const response = {
      id: updatedLayout.id,
      name: updatedLayout.name,
      description: updatedLayout.description,
      boxes: savedBoxes,
    };

    console.log("[Debug] Sending response:", response);

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    console.error("更新项目失败:", error);
    if (error instanceof Error) {
      return NextResponse.json({ message: "服务器错误", details: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "服务器错误" }, { status: 500 });
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

    const layout = await prisma.layout.findFirst({
      where: {
        id: layoutId,
        userId: decoded.userId,
      },
      include: {
        boxes: {
          include: {
            components: {
              include: {
                image: true,
              },
              orderBy: {
                sortOrder: 'asc'  // 组件排序
              }
            },
          },
          orderBy: {
            sortOrder: 'asc'  // 使用 sortOrder 而不是 id
          }
        },
      },
    });

    if (!layout) {
      return NextResponse.json({ message: "项目不存在" }, { status: 404 });
    }

    const formattedLayout: FormattedLayout = {
      id: layout.id,
      name: layout.name,
      description: layout.description,
      boxes: layout.boxes.map((box) => ({
        id: box.id,
        positionX: box.positionX,
        positionY: box.positionY,
        width: box.width,
        layout: box.columns > 1 ? {
          columns: box.columns
        } : undefined,
        components: box.components.map((comp) => ({
          id: comp.id,
          type: comp.type,
          width: comp.width,
          height: comp.height,
          props: comp.props as Record<string, unknown>,
          column: comp.columnIndex,
          file: comp.image
            ? {
                path: comp.image.path,
                size: comp.image.size || 0,
              }
            : undefined,
        })),
      })),
    };

    return NextResponse.json(formattedLayout, { status: 200 });
  } catch (error) {
    console.error("获取项目失败:", error);
    if (error instanceof Error) {
      return NextResponse.json({ message: "服务器错误", details: error.message }, { status: 500 });
    }
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