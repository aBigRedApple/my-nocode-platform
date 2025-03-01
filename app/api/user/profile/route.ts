import prisma from '@/prisma/client';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json({ message: '未提供令牌' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, '3f8e7d6c5b4a39281f0e1d2c3b4a5967d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2') as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true },
    });
    
    if (!user) {
      return NextResponse.json({ message: '用户不存在' }, { status: 404 });
    }
    
    const layouts = await prisma.layout.findMany({
      where: { userId: decoded.userId },
      select: { id: true, createdAt: true },
    });
    
    const templates = await prisma.template.findMany({
      where: { userId: decoded.userId },
      select: { id: true, layoutId: true },
    });
    
    return NextResponse.json({ user, layouts, templates }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: '令牌无效或过期' }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const { name, email } = await req.json();
  
  if (!token) {
    return NextResponse.json({ message: '未提供令牌' }, { status: 401 });
  }
  
  try {
    const decoded = jwt.verify(token, '3f8e7d6c5b4a39281f0e1d2c3b4a5967d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2') as { userId: string };
    
    // 检查邮箱是否已被其他用户注册
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    // 如果找到了用户且不是当前用户，则邮箱已被注册
    if (existingUser && existingUser.id !== decoded.userId) {
      return NextResponse.json({ message: '邮箱已被注册', code: 'EMAIL_TAKEN' }, { status: 400 });
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: { name, email },
      select: { name: true, email: true },
    });
    
    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    // 检查是否为Prisma唯一约束错误（邮箱重复）
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return NextResponse.json({ message: '邮箱已被注册', code: 'EMAIL_TAKEN' }, { status: 400 });
    }
    
    return NextResponse.json({ message: '更新失败或令牌无效' }, { status: 400 });
  }
}