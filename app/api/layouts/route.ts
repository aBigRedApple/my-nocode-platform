import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ message: "未授权" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as { userId: number };
    const { templateId } = await req.json();

    // 查找模板
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: { layout: true },
    });

    if (!template) {
      return NextResponse.json({ message: "模板不存在" }, { status: 404 });
    }

    // 创建新布局（基于模板的 layoutId）
    const project = await prisma.layout.create({
      data: {
        userId: decoded.userId,
        boxes: template.layoutId
          ? {
              create: (await prisma.box.findMany({ where: { layoutId: template.layoutId } })).map((box) => ({
                positionX: box.positionX,
                positionY: box.positionY,
                components: { create: box.components.map((comp) => ({ type: comp.type })) },
              })),
            }
          : { create: [] },
      },
    });

    return NextResponse.json({ projectId: project.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "创建项目失败" }, { status: 500 });
  }
}