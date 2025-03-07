import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || '3f8e7d6c5b4a39281f0e1d2c3b4a5967d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ message: '未授权' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const userId = decoded.userId;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: { template: true },
    });

    const templates = favorites.map(fav => ({
      id: fav.template.id,
      name: fav.template.name,
      description: fav.template.description,
      thumbnail: fav.template.thumbnail,
      category: fav.template.category,
    }));

    return NextResponse.json({ templates }, { status: 200 });
  } catch (error) {
    console.error('获取收藏模板失败:', error);
    return NextResponse.json(
      { message: '服务器错误', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}