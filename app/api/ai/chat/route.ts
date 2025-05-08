import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import axios from "axios";
import { writeFile } from "fs/promises";
import { join } from "path";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const DEEPSEEK_API_KEY = "sk-339c4c9441f541dcb732d02bed231007";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ message: "未授权" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const formData = await req.formData();
    
    const message = formData.get("message") as string;
    const history = JSON.parse(formData.get("history") as string);
    const files = formData.getAll("files") as File[];

    // 处理上传的文件
    const fileDescriptions = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // 保存文件到临时目录
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = join(process.cwd(), "tmp", fileName);
        await writeFile(filePath, buffer);
        
        return {
          name: file.name,
          type: file.type,
          size: file.size,
          path: filePath
        };
      })
    );

    // 构建文件描述
    const fileContext = fileDescriptions.length > 0
      ? `\n上传的文件：\n${fileDescriptions.map(f => `- ${f.name} (${f.type}, ${f.size} bytes)`).join('\n')}`
      : '';

    const response = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "你是一个专业的AI助手，可以帮助用户解决各种问题。请用简洁、专业的方式回答。"
          },
          ...history,
          {
            role: "user",
            content: message + fileContext
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return NextResponse.json({
      message: response.data.choices[0].message.content
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { message: "服务器错误" },
      { status: 500 }
    );
  }
} 