import prisma from '@/prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const { password } = await req.json();

  if (!token) {
    return NextResponse.json({ message: '未提供令牌' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, '3f8e7d6c5b4a39281f0e1d2c3b4a5967d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2') as { userId: string };
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: '密码更新成功' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: '更新密码失败或令牌无效' }, { status: 400 });
  }
}