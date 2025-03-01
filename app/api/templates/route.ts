import prisma from '@/prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { search, category, page, pageSize } = await req.json();
  
  console.log("接收到的请求数据:", { search, category, page, pageSize }); // 调试输出

  if (isNaN(page) || page < 1 || isNaN(pageSize) || pageSize < 1) {
    return NextResponse.json({ error: "无效的分页参数" }, { status: 400 });
  }

  try {
    const where: prisma.TemplateWhereInput = {};

    // 处理搜索逻辑
    if (search && search.trim()) {
      const keywords = search.trim().split(/\s+/).filter(k => k !== "");
      if (keywords.length > 0) {
        where.AND = keywords.map((keyword) => ({
          OR: [
            { name: { contains: keyword } },
            { description: { contains: keyword } },
          ],
        }));
      }
    }

    // 处理分类逻辑
    if (category && category !== "all") {
      where.category = { equals: category };
    }

    // 查询模板和统计数量
    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.template.count({ where }),
    ]);

    return NextResponse.json(
      { templates, total, searchQuery: search },
      { status: 200 }
    );
  } catch (error) {
    console.error("查询模板失败:", error);
    return NextResponse.json({ error: "服务器错误", details: error.message }, { status: 500 });
  }
}
