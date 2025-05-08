import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { generateComponentCode, getRequiredImports } from "@/utils/componentTemplates";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface Box {
  positionX: number;
  positionY: number;
  width: string;
  columns: number;
  sortOrder: number;
  components: {
    type: string;
    width: string;
    height: number;
    props: Record<string, unknown>;
    columnIndex: number;
  }[];
}

interface Layout {
  name: string;
  description: string | null;
  content: Record<string, unknown> | null;
  boxes: Box[];
}

const generateReactCode = (layout: Layout): string => {
  const imports = new Set<string>();
  imports.add("import React from 'react';");
  imports.add("import { Layout } from 'antd';");
  imports.add("import 'antd/dist/antd.css';");

  const boxComponents = layout.boxes.map((box) => {
    const boxImports = getRequiredImports(box.components);
    boxImports.forEach((imp) => imports.add(imp));

    const components = box.components.map((comp) => {
      return generateComponentCode(comp.type, comp.props as any);
    }).join('\n');

    return `
      <div 
        style={{
          position: 'relative',
          left: ${box.positionX}px,
          top: ${box.positionY}px,
          width: '${box.width}',
          display: 'grid',
          gridTemplateColumns: 'repeat(${box.columns}, 1fr)',
          gap: '16px',
          padding: '16px',
        }}
      >
        ${components}
      </div>
    `;
  }).join('\n');

  const code = `
${Array.from(imports).join('\n')}

const ${layout.name.replace(/[^a-zA-Z0-9]/g, '')} = () => {
  return (
    <Layout>
      <Layout.Content>
        ${boxComponents}
      </Layout.Content>
    </Layout>
  );
};

export default ${layout.name.replace(/[^a-zA-Z0-9]/g, '')};
  `;

  return code;
};

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ message: "未授权" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const layoutId = parseInt(await Promise.resolve(params.id));

    if (isNaN(layoutId)) {
      return NextResponse.json({ message: "无效的项目 ID" }, { status: 400 });
    }

    const layout = await prisma.layout.findUnique({
      where: { id: layoutId },
      include: {
        boxes: {
          include: {
            components: true,
          },
        },
      },
    });

    if (!layout || layout.userId !== decoded.userId) {
      return NextResponse.json({ message: "项目不存在或无权限" }, { status: 404 });
    }

    // 生成React代码
    const reactCode = generateReactCode(layout as unknown as Layout);

    // 设置响应头，指定这是一个JavaScript文件下载
    const headers = new Headers();
    headers.set("Content-Type", "application/javascript");
    
    // 使用 encodeURIComponent 处理文件名，并移除特殊字符
    const safeFileName = layout.name.replace(/[^a-zA-Z0-9]/g, '_');
    const encodedFileName = encodeURIComponent(safeFileName);
    headers.set("Content-Disposition", `attachment; filename="${encodedFileName}.jsx"`);

    return new NextResponse(reactCode, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("导出项目失败:", error);
    return NextResponse.json({ message: "服务器错误" }, { status: 500 });
  }
} 