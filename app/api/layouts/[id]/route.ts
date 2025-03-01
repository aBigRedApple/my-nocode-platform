// api/layouts/[id]/route.ts
import prisma from '@/prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ message: '未授权' }, { status: 401 });
    }

    const decoded = jwt.verify(token, '3f8e7d6c5b4a39281f0e1d2c3b4a5967d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2') as { userId: number };
    
    // Check if the layout exists and belongs to the user
    const layout = await prisma.layout.findUnique({
      where: { id: parseInt(params.id) },
      select: { userId: true }
    });

    if (!layout) {
      return NextResponse.json({ message: '项目不存在' }, { status: 404 });
    }

    if (layout.userId !== decoded.userId) {
      return NextResponse.json({ message: '无权删除此项目' }, { status: 403 });
    }

    // Delete the layout
    await prisma.layout.delete({
      where: { id: parseInt(params.id) }
    });

    return NextResponse.json({ message: '项目删除成功' }, { status: 200 });
  } catch (error) {
    console.error('删除项目失败:', error);
    return NextResponse.json({ message: '删除项目失败' }, { status: 500 });
  }
}