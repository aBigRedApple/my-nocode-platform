import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || '3f8e7d6c5b4a39281f0e1d2c3b4a5967d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ message: '未授权' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const userId = decoded.userId;
    const { templateId, action } = await req.json();

    if (action === 'add') {
      const existingFavorite = await prisma.favorite.findFirst({
        where: { userId, templateId },
      });
      if (!existingFavorite) {
        await prisma.favorite.create({
          data: { userId, templateId },
        });
      }
    } else if (action === 'remove') {
      await prisma.favorite.deleteMany({
        where: { userId, templateId },
      });
    } else {
      return NextResponse.json({ message: '无效的操作' }, { status: 400 });
    }

    return NextResponse.json({ message: '操作成功' }, { status: 200 });
  } catch (error) {
    console.error('收藏操作失败:', error);
    return NextResponse.json(
      { message: '服务器错误', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}