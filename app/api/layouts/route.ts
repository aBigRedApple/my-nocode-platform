import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || '3f8e7d6c5b4a39281f0e1d2c3b4a5967d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2';
export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ message: "未授权" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    console.log("Token 验证成功，用户 ID:", decoded.userId);

    const { templateId } = await req.json();
    console.log("请求的模板 ID:", templateId);

    if (!templateId || isNaN(templateId)) {
      return NextResponse.json({ message: "缺少或无效的模板 ID" }, { status: 400 });
    }

    const template = await prisma.template.findUnique({
      where: { id: Number(templateId) },
    });
    if (!template) {
      console.log("模板未找到，ID:", templateId);
      return NextResponse.json({ message: "模板不存在" }, { status: 404 });
    }
    console.log("找到模板:", template.name);

    // 创建新项目，并同步 boxes 和 components
    const project = await prisma.layout.create({
      data: {
        name: `${template.name} - 新项目`,
        description: template.description || "基于模板创建的项目",
        content: template.content || { boxes: [] }, // 保存 content 以备后续使用
        userId: decoded.userId,
        layoutLinks: { create: { templateId: template.id } },
        boxes: {
          create: template.content?.boxes?.map((box: any) => ({
            positionX: box.positionX,
            positionY: box.positionY,
            width: box.width,
            height: box.height,
            components: {
              create: box.components.map((comp: any) => ({
                type: comp.type,
                width: comp.width,
                height: comp.height,
                props: comp.props,
              })),
            },
          })) || [],
        },
      },
      include: {
        boxes: {
          include: { components: true },
        },
      },
    });
    console.log("新项目创建成功，ID:", project.id);

    // 返回完整项目数据，与 GET /api/layouts/<id> 一致
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("创建项目失败:", error);
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ message: "Token 已过期" }, { status: 401 });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: "无效的 Token" }, { status: 401 });
    }
    return NextResponse.json({ message: "服务器错误", details: error.message }, { status: 500 });
  }
}