import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const SECRET_KEY = '3f8e7d6c5b4a39281f0e1d2c3b4a5967d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2'; // 请确保密钥的安全性

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.split(' ')[1]; // 获取 Authorization header 中的 token

  if (!token) {
    return NextResponse.json({ message: 'Token is required' }, { status: 400 });
  }

  try {
    // 验证 token 是否有效
    const decoded = jwt.verify(token, SECRET_KEY);

    // 返回 token 解码后的用户信息
    return NextResponse.json({ message: 'Token is valid', user: decoded }, { status: 200 });
  } catch (error) {
    // 如果 token 无效或过期，返回错误
    return NextResponse.json({ message: 'Token is not valid' }, { status: 401 });
  }
}
