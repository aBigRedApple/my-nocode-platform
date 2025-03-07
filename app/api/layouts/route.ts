import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma/client';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '3f8e7d6c5b4a39281f0e1d2c3b4a5967d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ message: '未授权' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const { templateId } = await req.json();

    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: { layout: { include: { boxes: { include: { components: true } } } } },
    });

    if (!template || !template.layout) {
      return NextResponse.json({ message: '模板或布局不存在' }, { status: 400 });
    }

    const newLayout = await prisma.layout.create({
      data: {
        userId: decoded.userId,
        name: `${template.name} - 新项目`,
        description: template.description,
        boxes: {
          create: template.layout.boxes.map((box) => ({
            positionX: box.positionX,
            positionY: box.positionY,
            width: box.width,
            height: box.height,
            components: {
              create: box.components.map((comp) => ({
                type: comp.type,
                width: comp.width,
                height: comp.height,
                props: comp.props,
              })),
            },
          })),
        },
      },
    });

    return NextResponse.json({ projectId: newLayout.id }, { status: 201 });
  } catch (error) {
    console.error('创建项目失败:', error);
    return NextResponse.json({ message: '服务器错误' }, { status: 500 });
  }
}