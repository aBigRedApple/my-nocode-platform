import { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import path from "path";

const prisma = new PrismaClient();

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: path.join(process.cwd(), "public/uploads"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage }).single("image");

export const config = {
  api: {
    bodyParser: false, // 禁用默认 bodyParser 以使用 multer
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: "Upload failed", error: err.message });
    }

    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { componentId } = req.body; // 从前端传递 componentId
    const filePath = `/uploads/${file.filename}`;

    try {
      // 保存图片信息到 Image 表
      const image = await prisma.image.create({
        data: {
          path: filePath,
          size: file.size,
          component: {
            connect: { id: Number(componentId) }, // 关联到 Component
          },
        },
      });

      // 更新 Component 的 props.src
      await prisma.component.update({
        where: { id: Number(componentId) },
        data: { imageId: image.id },
      });

      res.status(200).json({ url: filePath });
    } catch (error) {
      res.status(500).json({ message: "Database error", error: (error as Error).message });
    }
  });
}