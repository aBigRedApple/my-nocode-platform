import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import axios from "axios";
import { writeFile } from "fs/promises";
import { join } from "path";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const DEEPSEEK_API_KEY = "sk-339c4c9441f541dcb732d02bed231007";

interface MessageHistory {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ message: "未授权" }, { status: 401 });
  }

  try {
    // 验证token有效性，但此处不需要使用解码后的用户ID
    jwt.verify(token, JWT_SECRET);
    
    const formData = await req.formData();
    
    const message = formData.get("message") as string;
    const history = JSON.parse(formData.get("history") as string) as MessageHistory[];
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

    // 优化系统提示词，引导AI生成更结构化的回答
    const systemPrompt = `你是一个专业的AI助手，请遵循以下指导原则回答问题：

1. 回答应简洁明了，避免冗余内容，直接回答用户问题
2. 如果需要列出步骤或列表，请使用明确的编号或符号标记
3. 对于复杂问题，将回答分为简短的段落，每段一个要点
4. 使用适当的标点符号分隔内容，提高可读性
5. 避免过度礼貌用语或重复内容
6. 专业术语应配有简短解释
7. 保持回答的连贯性和逻辑性

请用专业、友好和结构清晰的方式回答用户问题。`;

    const response = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          ...history.map((msg: MessageHistory) => ({
            role: msg.role,
            content: msg.content
          })),
          {
            role: "user",
            content: message + fileContext
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      },
      {
        headers: {
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    // 格式化AI回答
    const aiResponse = formatAIResponse(response.data.choices[0].message.content);

    return NextResponse.json({
      message: aiResponse
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { message: "服务器错误，请稍后再试" },
      { status: 500 }
    );
  }
}

// 格式化AI响应，使其更易读和结构化
function formatAIResponse(text: string): string {
  if (!text) return "抱歉，我无法处理您的请求。";

  // 移除过多的空行
  text = text.replace(/\n{3,}/g, "\n\n");
  
  // 确保列表项格式化正确
  text = text.replace(/^\s*[-*]\s+/gm, "• ");
  text = text.replace(/^\s*(\d+)[.、)]\s+/gm, "$1. ");
  
  // 添加代码块格式化
  text = text.replace(/```([\s\S]*?)```/g, "\n```$1```\n");
  
  // 格式化标题
  text = text.replace(/^(#{1,3})\s+(.+)$/gm, "\n$1 $2\n");
  
  return text;
} 