import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface KeywordMapping {
  keywords: string[];
  templateIds: number[];
  category: string;
}

// 关键词到模板的映射配置
const keywordMappings: KeywordMapping[] = [
  {
    category: "电商",
    keywords: [
      "电商", "商城", "购物", "产品展示", "商品展示", "商品详情", "产品详情", 
      "电子商务", "在线商城", "购物车", "产品列表", "商品列表", "商店", "店铺",
      "网店", "网上商城", "销售", "零售", "产品推广", "产品营销", "商品分类"
    ],
    templateIds: [2, 4, 7]  // 对应电商相关模板ID
  },
  {
    category: "博客",
    keywords: [
      "树洞", "博客", "日记", "心情", "记录", "个人网站", "个人主页", "文章", 
      "笔记", "随笔", "日志", "个人空间", "文章列表", "博文", "个人简介",
      "个人分享", "生活记录", "心情随笔", "思考", "旅行记录"
    ],
    templateIds: [6, 9]  // 博客相关模板ID
  },
  {
    category: "企业",
    keywords: [
      "企业", "公司", "官网", "团队", "业务介绍", "服务", "关于我们", "联系我们",
      "企业简介", "公司介绍", "产品服务", "解决方案", "团队介绍", "企业文化",
      "公司动态", "新闻", "企业展示", "品牌", "招聘"
    ],
    templateIds: [1, 3, 8]  // 企业相关模板ID
  },
  {
    category: "作品集",
    keywords: [
      "作品集", "作品展示", "案例", "设计", "摄影", "作品", "作品集展示", "创意",
      "项目展示", "个人作品", "艺术展示", "创作", "作品集网站", "作品案例", 
      "设计师作品", "作品陈列", "艺术家", "作品集合"
    ],
    templateIds: [5, 10]  // 作品集相关模板ID
  },
  {
    category: "活动",
    keywords: [
      "活动", "会议", "展览", "展会", "活动页", "活动展示", "报名", "活动报名",
      "会议安排", "展会信息", "活动策划", "活动预告", "倒计时", "活动详情",
      "嘉宾介绍", "议程安排", "活动回顾"
    ],
    templateIds: [11, 12]  // 活动相关模板ID
  }
];

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string" || query.trim() === "") {
      return NextResponse.json({ error: "请提供搜索关键词" }, { status: 400 });
    }

    const trimmedQuery = query.trim().toLowerCase();
    
    // 分割查询词为多个关键词
    const queryKeywords = trimmedQuery.split(/\s+|,|，|、|;|；/)
      .filter(word => word.length > 1)  // 过滤掉单字
      .map(word => word.trim());
    
    // 初始化需要查询的模板IDs和权重
    const templateScores: Record<number, number> = {};
    const matchedCategories: Set<string> = new Set();
    
    // 对每个关键词匹配进行计分
    if (queryKeywords.length > 0) {
      // 关键词匹配
      for (const queryWord of queryKeywords) {
        for (const mapping of keywordMappings) {
          for (const keyword of mapping.keywords) {
            // 完全匹配得分高
            if (queryWord === keyword) {
              mapping.templateIds.forEach(id => {
                templateScores[id] = (templateScores[id] || 0) + 3;
                matchedCategories.add(mapping.category);
              });
            } 
            // 包含匹配得分中
            else if (queryWord.includes(keyword) || keyword.includes(queryWord)) {
              mapping.templateIds.forEach(id => {
                templateScores[id] = (templateScores[id] || 0) + 2;
                matchedCategories.add(mapping.category);
              });
            }
          }
        }
      }
    } else {
      // 如果没有有效关键词，尝试整句匹配
      for (const mapping of keywordMappings) {
        for (const keyword of mapping.keywords) {
          if (trimmedQuery.includes(keyword)) {
            mapping.templateIds.forEach(id => {
              templateScores[id] = (templateScores[id] || 0) + 1;
              matchedCategories.add(mapping.category);
            });
          }
        }
      }
    }
    
    // 如果没有匹配到任何模板，返回空结果而不是推荐热门模板
    if (Object.keys(templateScores).length === 0) {
      return NextResponse.json({ 
        success: true, 
        templates: [],
        message: "抱歉，暂无相关模板"
      });
    }
    
    // 根据分数对模板ID排序
    const sortedTemplateIds = Object.entries(templateScores)
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .map(([id]) => parseInt(id));
    
    // 查询排序后的模板
    const matches = await prisma.template.findMany({
      where: {
        id: {
          in: sortedTemplateIds
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail: true,
        category: true,
        content: false, // 不需要返回内容
        keywords: true,
      }
    });

    // 手动按照分数排序结果排序
    const sortedMatches = [...matches].sort((a, b) => {
      const indexA = sortedTemplateIds.indexOf(Number(a.id));
      const indexB = sortedTemplateIds.indexOf(Number(b.id));
      return indexA - indexB;
    });

    // 取前5个最匹配的结果
    const limitedMatches = sortedMatches.slice(0, 5);
    
    // 构建丰富的响应信息
    const responseMessage = limitedMatches.length > 0 
      ? `找到 ${limitedMatches.length} 个与「${Array.from(matchedCategories).join('、')}」相关的模板` 
      : "抱歉，暂无相关模板";

    return NextResponse.json({ 
      success: true, 
      templates: limitedMatches,
      message: responseMessage,
      matchType: "keyword",
      matchedCategories: Array.from(matchedCategories)
    });
  } catch (error) {
    console.error("模板搜索失败:", error);
    return NextResponse.json({ 
      success: false, 
      message: "服务器错误，模板搜索失败" 
    }, { status: 500 });
  }
}
