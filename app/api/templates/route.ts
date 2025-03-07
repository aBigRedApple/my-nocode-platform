import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || '3f8e7d6c5b4a39281f0e1d2c3b4a5967d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { page = 1, pageSize = 8, search, category } = body;

    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    let userId: number | null = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        userId = decoded.userId;
      } catch (jwtError) {
        console.error('JWT 验证失败:', jwtError);
      }
    }

    const whereClause: any = {};
    if (search && typeof search === 'string' && search.trim()) {
      whereClause.OR = [
        { name: { contains: search.trim() } },
        { description: { contains: search.trim() } },
      ];
    }
    if (category && category !== 'all') {
      whereClause.category = category;
    }

    const templates = await prisma.template.findMany({
      where: whereClause,
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.template.count({ where: whereClause });

    let favorites: number[] = [];
    if (userId) {
      favorites = (await prisma.favorite.findMany({
        where: { userId },
        select: { templateId: true },
      })).map(fav => fav.templateId);
    }

    const enrichedTemplates = templates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description || undefined,
      thumbnail: template.thumbnail || undefined,
      category: template.category,
      isFavorite: favorites.includes(template.id),
    }));

    return NextResponse.json(
      { templates: enrichedTemplates, total, searchQuery: search || '' },
      { status: 200 }
    );
  } catch (error) {
    console.error('获取模板失败:', error);
    return NextResponse.json(
      { message: '服务器错误', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}