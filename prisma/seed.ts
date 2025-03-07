const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// 可用的组件类型
const COMPONENT_TYPES = {
  BUTTON: { type: "button", label: "按钮" },
  TEXT: { type: "text", label: "文本" },
  RADIO: { type: "radio", label: "单选" },
  CHECKBOX: { type: "checkbox", label: "多选" },
  IMAGE: { type: "image", label: "图片" },
  DATE: { type: "date", label: "日期" },
  DATE_RANGE: { type: "dateRange", label: "日期区间" },
  TABLE: { type: "table", label: "表格" },
};

async function seed() {
  try {
    // 清空模板表
    await prisma.template.deleteMany();
    console.log("已清空模板表");

    // 定义 10 个优化后的模板数据
    const templates = [
      {
        id: 1,
        name: "商业计划书模板",
        description: "优雅的商业展示模板",
        thumbnail: "/templates/business-plan.jpg",
        category: "business",
        content: {
          boxes: [
            {
              id: 1,
              positionX: 40,
              positionY: 20,
              width: 400,
              height: 300,
              components: [
                {
                  id: 1,
                  ...COMPONENT_TYPES.TEXT,
                  width: 360,
                  height: 60,
                  props: {
                    content: "商业计划书",
                    style: { fontSize: 24, color: "#2c3e50", fontWeight: "bold" },
                  },
                  imageId: null,
                },
                {
                  id: 2,
                  ...COMPONENT_TYPES.TEXT,
                  width: 360,
                  height: 80,
                  props: {
                    content: "公司: 未来科技有限公司\n目标: 技术创新",
                    style: { fontSize: 14, color: "#7f8c8d" },
                  },
                  imageId: null,
                },
              ],
            },
            {
              id: 2,
              positionX: 460,
              positionY: 20,
              width: 340,
              height: 300,
              components: [
                {
                  id: 3,
                  ...COMPONENT_TYPES.TABLE,
                  width: 300,
                  height: 140,
                  props: {
                    rows: 3,
                    columns: 3,
                    data: [
                      ["目标", "收入", "用户数"],
                      ["短期", "$1M", "10K"],
                      ["长期", "$5M", "50K"],
                    ],
                    style: { border: "1px solid #ecf0f1", backgroundColor: "#f9f9f9" },
                  },
                  imageId: null,
                },
                {
                  id: 4,
                  ...COMPONENT_TYPES.BUTTON,
                  width: 120,
                  height: 40,
                  props: {
                    content: "查看详情",
                    style: { backgroundColor: "#3498db", color: "#fff", borderRadius: 5 },
                  },
                  imageId: null,
                },
              ],
            },
          ],
        },
      },
      {
        id: 2,
        name: "个人简历模板",
        description: "简洁现代的简历设计",
        thumbnail: "/templates/resume.jpg",
        category: "personal",
        content: {
          boxes: [
            {
              id: 3,
              positionX: 40,
              positionY: 20,
              width: 240,
              height: 350,
              components: [
                {
                  id: 5,
                  ...COMPONENT_TYPES.IMAGE,
                  width: 200,
                  height: 200,
                  props: { src: "http://localhost:3000/uploads/resume-profile.jpg" },
                  imageId: 1,
                },
                {
                  id: 6,
                  ...COMPONENT_TYPES.TEXT,
                  width: 200,
                  height: 100,
                  props: {
                    content: "张三\n123-456-7890",
                    style: { fontSize: 16, color: "#34495e", textAlign: "center" },
                  },
                  imageId: null,
                },
              ],
            },
            {
              id: 4,
              positionX: 300,
              positionY: 20,
              width: 500,
              height: 350,
              components: [
                {
                  id: 7,
                  ...COMPONENT_TYPES.TEXT,
                  width: 460,
                  height: 60,
                  props: {
                    content: "个人简历",
                    style: { fontSize: 22, color: "#2980b9" },
                  },
                  imageId: null,
                },
                {
                  id: 8,
                  ...COMPONENT_TYPES.TABLE,
                  width: 460,
                  height: 180,
                  props: {
                    rows: 3,
                    columns: 2,
                    data: [
                      ["教育", "北京大学，2018-2022"],
                      ["经验", "XYZ公司，2022至今"],
                      ["技能", "Figma: 85%"],
                    ],
                    style: { border: "1px solid #ddd", fontSize: 14 },
                  },
                  imageId: null,
                },
              ],
            },
          ],
        },
      },
      {
        id: 3,
        name: "产品展示模板",
        description: "现代化的产品介绍",
        thumbnail: "/templates/product.jpg",
        category: "business",
        content: {
          boxes: [
            {
              id: 5,
              positionX: 40,
              positionY: 20,
              width: 400,
              height: 320,
              components: [
                {
                  id: 9,
                  ...COMPONENT_TYPES.IMAGE,
                  width: 360,
                  height: 240,
                  props: { src: "http://localhost:3000/uploads/product-image1.jpg" },
                  imageId: 2,
                },
              ],
            },
            {
              id: 6,
              positionX: 460,
              positionY: 20,
              width: 340,
              height: 320,
              components: [
                {
                  id: 10,
                  ...COMPONENT_TYPES.TEXT,
                  width: 300,
                  height: 60,
                  props: {
                    content: "智能设备",
                    style: { fontSize: 20, color: "#e74c3c" },
                  },
                  imageId: null,
                },
                {
                  id: 11,
                  ...COMPONENT_TYPES.TEXT,
                  width: 300,
                  height: 80,
                  props: {
                    content: "革命性的技术产品",
                    style: { fontSize: 14, color: "#7f8c8d" },
                  },
                  imageId: null,
                },
                {
                  id: 12,
                  ...COMPONENT_TYPES.BUTTON,
                  width: 120,
                  height: 40,
                  props: {
                    content: "了解更多",
                    style: { backgroundColor: "#e74c3c", color: "#fff", borderRadius: 5 },
                  },
                  imageId: null,
                },
              ],
            },
          ],
        },
      },
      {
        id: 4,
        name: "教育演示模板",
        description: "简洁的教学演示",
        thumbnail: "/templates/education.jpg",
        category: "education",
        content: {
          boxes: [
            {
              id: 7,
              positionX: 40,
              positionY: 20,
              width: 760,
              height: 300,
              components: [
                {
                  id: 13,
                  ...COMPONENT_TYPES.TEXT,
                  width: 720,
                  height: 80,
                  props: {
                    content: "现代教育技术",
                    style: { fontSize: 28, color: "#27ae60", textAlign: "center" },
                  },
                  imageId: null,
                },
                {
                  id: 14,
                  ...COMPONENT_TYPES.TEXT,
                  width: 720,
                  height: 100,
                  props: {
                    content: "探索未来的学习方式",
                    style: { fontSize: 16, color: "#7f8c8d", textAlign: "center" },
                  },
                  imageId: null,
                },
                {
                  id: 15,
                  ...COMPONENT_TYPES.BUTTON,
                  width: 120,
                  height: 40,
                  props: {
                    content: "下一页",
                    style: { backgroundColor: "#27ae60", color: "#fff", borderRadius: 5 },
                  },
                  imageId: null,
                },
              ],
            },
          ],
        },
      },
      {
        id: 5,
        name: "公司简介模板",
        description: "简约的公司介绍",
        thumbnail: "/templates/company-profile.jpg",
        category: "business",
        content: {
          boxes: [
            {
              id: 8,
              positionX: 40,
              positionY: 20,
              width: 760,
              height: 300,
              components: [
                {
                  id: 16,
                  ...COMPONENT_TYPES.TEXT,
                  width: 720,
                  height: 60,
                  props: {
                    content: "公司简介",
                    style: { fontSize: 24, color: "#8e44ad" },
                  },
                  imageId: null,
                },
                {
                  id: 17,
                  ...COMPONENT_TYPES.IMAGE,
                  width: 300,
                  height: 180,
                  props: { src: "http://localhost:3000/uploads/team-photo.jpg" },
                  imageId: 3,
                },
                {
                  id: 18,
                  ...COMPONENT_TYPES.TEXT,
                  width: 400,
                  height: 80,
                  props: {
                    content: "创新驱动未来",
                    style: { fontSize: 14, color: "#7f8c8d" },
                  },
                  imageId: null,
                },
              ],
            },
          ],
        },
      },
      {
        id: 6,
        name: "个人博客模板",
        description: "清新的博客设计",
        thumbnail: "/templates/blog.jpg",
        category: "personal",
        content: {
          boxes: [
            {
              id: 9,
              positionX: 40,
              positionY: 20,
              width: 400,
              height: 320,
              components: [
                {
                  id: 19,
                  ...COMPONENT_TYPES.IMAGE,
                  width: 360,
                  height: 240,
                  props: { src: "http://localhost:3000/uploads/sunny-day.jpg" },
                  imageId: 4,
                },
              ],
            },
            {
              id: 10,
              positionX: 460,
              positionY: 20,
              width: 340,
              height: 320,
              components: [
                {
                  id: 20,
                  ...COMPONENT_TYPES.TEXT,
                  width: 300,
                  height: 60,
                  props: {
                    content: "美好一天",
                    style: { fontSize: 20, color: "#f1c40f" },
                  },
                  imageId: null,
                },
                {
                  id: 21,
                  ...COMPONENT_TYPES.TEXT,
                  width: 300,
                  height: 80,
                  props: {
                    content: "阳光明媚，心情愉快",
                    style: { fontSize: 14, color: "#7f8c8d" },
                  },
                  imageId: null,
                },
                {
                  id: 22,
                  ...COMPONENT_TYPES.BUTTON,
                  width: 120,
                  height: 40,
                  props: {
                    content: "阅读更多",
                    style: { backgroundColor: "#f1c40f", color: "#fff", borderRadius: 5 },
                  },
                  imageId: null,
                },
              ],
            },
          ],
        },
      },
      {
        id: 7,
        name: "课堂笔记模板",
        description: "实用的笔记布局",
        thumbnail: "/templates/notes.jpg",
        category: "education",
        content: {
          boxes: [
            {
              id: 11,
              positionX: 40,
              positionY: 20,
              width: 760,
              height: 300,
              components: [
                {
                  id: 23,
                  ...COMPONENT_TYPES.TEXT,
                  width: 720,
                  height: 80,
                  props: {
                    content: "现代物理学笔记",
                    style: { fontSize: 22, color: "#d35400" },
                  },
                  imageId: null,
                },
                {
                  id: 24,
                  ...COMPONENT_TYPES.TEXT,
                  width: 720,
                  height: 100,
                  props: {
                    content: "1. 量子力学\n2. 相对论",
                    style: { fontSize: 14, color: "#7f8c8d" },
                  },
                  imageId: null,
                },
                {
                  id: 25,
                  ...COMPONENT_TYPES.CHECKBOX,
                  width: 200,
                  height: 60,
                  props: {
                    options: ["复习", "作业"],
                    selected: ["复习"],
                    style: { color: "#d35400" },
                  },
                  imageId: null,
                },
              ],
            },
          ],
        },
      },
      {
        id: 8,
        name: "营销计划模板",
        description: "高效的营销布局",
        thumbnail: "/templates/marketing.jpg",
        category: "business",
        content: {
          boxes: [
            {
              id: 12,
              positionX: 40,
              positionY: 20,
              width: 760,
              height: 300,
              components: [
                {
                  id: 26,
                  ...COMPONENT_TYPES.TEXT,
                  width: 720,
                  height: 60,
                  props: {
                    content: "营销计划",
                    style: { fontSize: 24, color: "#c0392b" },
                  },
                  imageId: null,
                },
                {
                  id: 27,
                  ...COMPONENT_TYPES.TABLE,
                  width: 720,
                  height: 140,
                  props: {
                    rows: 3,
                    columns: 2,
                    data: [
                      ["目标", "策略"],
                      ["销量", "促销"],
                      ["品牌", "社交媒体"],
                    ],
                    style: { border: "1px solid #ecf0f1" },
                  },
                  imageId: null,
                },
                {
                  id: 28,
                  ...COMPONENT_TYPES.BUTTON,
                  width: 120,
                  height: 40,
                  props: {
                    content: "执行",
                    style: { backgroundColor: "#c0392b", color: "#fff", borderRadius: 5 },
                  },
                  imageId: null,
                },
              ],
            },
          ],
        },
      },
      {
        id: 9,
        name: "日记模板",
        description: "温馨的日记设计",
        thumbnail: "/templates/diary.jpg",
        category: "personal",
        content: {
          boxes: [
            {
              id: 13,
              positionX: 40,
              positionY: 20,
              width: 760,
              height: 300,
              components: [
                {
                  id: 29,
                  ...COMPONENT_TYPES.DATE,
                  width: 200,
                  height: 40,
                  props: {
                    value: "2025-03-07",
                    style: { fontSize: 16, color: "#16a085" },
                  },
                  imageId: null,
                },
                {
                  id: 30,
                  ...COMPONENT_TYPES.TEXT,
                  width: 720,
                  height: 100,
                  props: {
                    content: "今天阳光明媚，心情很好",
                    style: { fontSize: 14, color: "#7f8c8d" },
                  },
                  imageId: null,
                },
                {
                  id: 31,
                  ...COMPONENT_TYPES.RADIO,
                  width: 200,
                  height: 60,
                  props: {
                    options: ["开心", "平静", "疲惫"],
                    selected: "开心",
                    style: { color: "#16a085" },
                  },
                  imageId: null,
                },
              ],
            },
          ],
        },
      },
      {
        id: 10,
        name: "课程表模板",
        description: "清晰的课程规划",
        thumbnail: "/templates/schedule.jpg",
        category: "education",
        content: {
          boxes: [
            {
              id: 14,
              positionX: 40,
              positionY: 20,
              width: 760,
              height: 300,
              components: [
                {
                  id: 32,
                  ...COMPONENT_TYPES.TEXT,
                  width: 720,
                  height: 60,
                  props: {
                    content: "本周课程表",
                    style: { fontSize: 22, color: "#2980b9" },
                  },
                  imageId: null,
                },
                {
                  id: 33,
                  ...COMPONENT_TYPES.TABLE,
                  width: 720,
                  height: 140,
                  props: {
                    rows: 3,
                    columns: 2,
                    data: [
                      ["时间", "课程"],
                      ["9:00", "数学"],
                      ["10:00", "英语"],
                    ],
                    style: { border: "1px solid #ddd" },
                  },
                  imageId: null,
                },
                {
                  id: 34,
                  ...COMPONENT_TYPES.DATE_RANGE,
                  width: 200,
                  height: 40,
                  props: {
                    start: "2025-03-07",
                    end: "2025-03-14",
                    style: { fontSize: 14, color: "#2980b9" },
                  },
                  imageId: null,
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
    await prisma.$disconnect();
  }
}

// 执行种子函数
seed();