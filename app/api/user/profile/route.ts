import prisma from '@/prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// 定义环境变量的密钥
const JWT_SECRET = process.env.JWT_SECRET || '3f8e7d6c5b4a39281f0e1d2c3b4a5967d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2';

// 类型定义
interface UserResponse {
  user: {
    name: string;
    email: string;
  };
  layouts: Array<{
    id: number;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
  templates: any[];
}

interface ErrorResponse {
  message: string;
  details?: string;
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ message: '未授权' } as ErrorResponse, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email?: string };

    if (!decoded.userId) {
      return NextResponse.json({ message: '无效的 token，缺少 userId' } as ErrorResponse, { status: 401 });
    }

    // 使用 userId 查询用户，并按 updatedAt 降序排序 layouts
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        layouts: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            updatedAt: 'desc', // 按更新时间降序排序
          },
        },
        templates: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: '用户不存在' } as ErrorResponse, { status: 404 });
    }

    const response: UserResponse = {
      user: {
        name: user.name,
        email: user.email,
      },
      layouts: user.layouts,
      templates: user.templates,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('获取用户数据失败:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { message: '无效的 token', details: error.message } as ErrorResponse,
        { status: 401 }
      );
    }
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { message: 'token 已过期', details: error.message } as ErrorResponse,
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: '服务器错误', details: error.message } as ErrorResponse,
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ message: "未授权" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const body = await req.json(); // 获取请求体中的 name 和 email
    const { name, email } = body;

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: { name, email },
    });

    return NextResponse.json(
      { user: { name: updatedUser.name, email: updatedUser.email } },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: "更新失败", details: error.message }, { status: 500 });
  }
}