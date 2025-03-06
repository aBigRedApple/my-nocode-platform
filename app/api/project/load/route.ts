import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const layouts = await prisma.layout.findMany({
      include: {
        boxes: {
          include: {
            components: {
              include: { image: true },
            },
          },
        },
      },
    });

    // 假设加载最新布局
    const latestLayout = layouts[layouts.length - 1];
    if (!latestLayout) {
      return res.status(200).json({ boxes: [] });
    }

    res.status(200).json({ boxes: latestLayout.boxes });
  } catch (error) {
    console.error("Load error:", error);
    res.status(500).json({ message: "Load error", error: (error as Error).message });
  }
};

export default handler;