const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seed() {
  try {
    // 清空模板表
    await prisma.template.deleteMany();
    console.log("已清空模板表");

    // 定义 10 个模板数据
    const templates = [
      {
        id: 1,
        name: "商业计划书模板",
        description: "适用于创业公司和商业展示的专业模板",
        thumbnail: "/templates/business-plan.jpg",
        category: "business",
        content: {
          boxes: [
            {
              id: 1,
              positionX: 0,
              positionY: 68,
              width: 300,
              height: 350,
              components: [
                {
                  id: 1,
                  type: "header",
                  width: 280,
                  height: 40,
                  props: { content: "商业计划书标题" },
                },
                {
                  id: 2,
                  type: "paragraph",
                  width: 280,
                  height: 100,
                  props: { content: "这是商业计划书的内容..." },
                },
              ],
            },
          ],
        },
      },
      {
        id: 2,
        name: "个人简历模板",
        description: "简洁优雅的个人简历设计",
        thumbnail: "/templates/resume.jpg",
        category: "personal",
        content: {
          boxes: [
            {
              id: 1,
              positionX: 0,
              positionY: 50,
              width: 300,
              height: 350,
              components: [
                {
                  id: 1,
                  type: "image",
                  width: 100,
                  height: 150,
                  props: { src: "/uploads/resume-profile.jpg" },
                },
                {
                  id: 2,
                  type: "text",
                  width: 180,
                  height: 80,
                  props: { content: "姓名: 张三\n年龄: 28\n职业: 设计师" },
                },
              ],
            },
          ],
        },
      },
      {
        id: 3,
        name: "产品展示模板",
        description: "展示产品特点的模板",
        thumbnail: "/templates/product.jpg",
        category: "business",
        content: {
          boxes: [
            {
              id: 1,
              positionX: 20,
              positionY: 20,
              width: 300,
              height: 350,
              components: [
                {
                  id: 1,
                  type: "image",
                  width: 280,
                  height: 200,
                  props: { src: "/uploads/product-image.jpg" },
                },
                {
                  id: 2,
                  type: "text",
                  width: 280,
                  height: 60,
                  props: { content: "产品名称: 示例产品" },
                },
              ],
            },
          ],
        },
      },
      {
        id: 4,
        name: "教育演示模板",
        description: "适合课堂教学和学术报告",
        thumbnail: "/templates/education.jpg",
        category: "education",
        content: {
          boxes: [
            {
              id: 1,
              positionX: 0,
              positionY: 0,
              width: 300,
              height: 400,
              components: [
                {
                  id: 1,
                  type: "slide",
                  width: 280,
                  height: 300,
                  props: { content: "教育演示第一页" },
                },
              ],
            },
          ],
        },
      },
      {
        id: 5,
        name: "公司简介模板",
        description: "展示公司文化和业务的最佳选择",
        thumbnail: "/templates/company-profile.jpg",
        category: "business",
        content: {
          boxes: [
            {
              id: 1,
              positionX: 10,
              positionY: 10,
              width: 300,
              height: 350,
              components: [
                {
                  id: 1,
                  type: "header",
                  width: 280,
                  height: 40,
                  props: { content: "公司简介" },
                },
                {
                  id: 2,
                  type: "paragraph",
                  width: 280,
                  height: 100,
                  props: { content: "我们是一家创新公司..." },
                },
              ],
            },
          ],
        },
      },
      {
        id: 6,
        name: "个人博客模板",
        description: "记录生活点滴的个性化模板",
        thumbnail: "/templates/blog.jpg",
        category: "personal",
        content: {
          boxes: [
            {
              id: 1,
              positionX: 0,
              positionY: 100,
              width: 300,
              height: 350,
              components: [
                {
                  id: 1,
                  type: "text",
                  width: 280,
                  height: 100,
                  props: { content: "今天是美好的一天..." },
                },
                {
                  id: 2,
                  type: "image",
                  width: 150,
                  height: 150,
                  props: { src: "/uploads/sunny-day.jpg" },
                },
              ],
            },
          ],
        },
      },
      {
        id: 7,
        name: "课堂笔记模板",
        description: "学生和教师的理想笔记工具",
        thumbnail: "/templates/notes.jpg",
        category: "education",
        content: {
          boxes: [
            {
              id: 1,
              positionX: 0,
              positionY: 50,
              width: 300,
              height: 350,
              components: [
                {
                  id: 1,
                  type: "text",
                  width: 280,
                  height: 50,
                  props: { content: "课堂笔记：这节课讲解了..." },
                },
                {
                  id: 2,
                  type: "list",
                  width: 280,
                  height: 100,
                  props: { items: ["要点1", "要点2", "要点3"] },
                },
              ],
            },
          ],
        },
      },
      {
        id: 8,
        name: "营销计划模板",
        description: "助力营销活动的专业模板",
        thumbnail: "/templates/marketing.jpg",
        category: "business",
        content: {
          boxes: [
            {
              id: 1,
              positionX: 0,
              positionY: 100,
              width: 300,
              height: 350,
              components: [
                {
                  id: 1,
                  type: "header",
                  width: 280,
                  height: 40,
                  props: { content: "营销计划" },
                },
                {
                  id: 2,
                  type: "table",
                  width: 280,
                  height: 100,
                  props: { data: [["目标", "策略"], ["增加销量", "促销活动"]] },
                },
              ],
            },
          ],
        },
      },
      {
        id: 9,
        name: "日记模板",
        description: "简单实用的每日记录模板",
        thumbnail: "/templates/diary.jpg",
        category: "personal",
        content: {
          boxes: [
            {
              id: 1,
              positionX: 0,
              positionY: 80,
              width: 300,
              height: 350,
              components: [
                {
                  id: 1,
                  type: "text",
                  width: 280,
                  height: 50,
                  props: { content: "今天的心情很好..." },
                },
              ],
            },
          ],
        },
      },
      {
        id: 10,
        name: "课程表模板",
        description: "清晰规划课程时间的模板",
        thumbnail: "/templates/schedule.jpg",
        category: "education",
        content: {
          boxes: [
            {
              id: 1,
              positionX: 0,
              positionY: 120,
              width: 300,
              height: 350,
              components: [
                {
                  id: 1,
                  type: "table",
                  width: 280,
                  height: 150,
                  props: { data: [["时间", "课程"], ["9:00", "数学"], ["10:00", "英语"]] },
                },
              ],
            },
          ],
        },
      },
    ];

    // 将模板数据插入数据库
    await prisma.template.createMany({ data: templates });
    console.log("模板数据已成功插入数据库");
  } catch (error) {
    console.error("插入数据失败:", error);
  } finally {
    // 断开数据库连接
    await prisma.$disconnect();
  }
}

// 执行种子函数
seed();