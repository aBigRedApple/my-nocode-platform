import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 假设有一个简单的缓存（如 Redis）
const cache = new Map();

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string" || query.trim() === "") {
      return NextResponse.json({ error: "请提供搜索关键词" }, { status: 400 });
    }

    const trimmedQuery = query.trim().toLowerCase();

    // 检查缓存中是否存在相同查询结果
    if (cache.has(trimmedQuery)) {
      return NextResponse.json({ templates: cache.get(trimmedQuery) });
    }

    // 查询数据库
    const matches = await prisma.template.findMany({
      where: {
        OR: [
          {
            name: {
              contains: trimmedQuery,
            },
          },
          {
            description: {
              contains: trimmedQuery,
            },
          },
          {
            keywords: {
              array_contains: trimmedQuery,
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail: true,
        category: true,
        content: true,
      },
      take: 5, // 限制返回结果数量
    });

    // 如果有匹配结果，缓存它
    if (matches.length > 0) {
      cache.set(trimmedQuery, matches);
    }

    return NextResponse.json({ templates: matches });
  } catch (error) {
    console.error("模板搜索失败:", error);
    return NextResponse.json({ error: "服务器错误，模板搜索失败" }, { status: 500 });
  }
}
