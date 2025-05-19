const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const COMPONENT_TYPES = {
  BUTTON: "button",
  TEXT: "text",
  RADIO: "radio",
  CHECKBOX: "checkbox",
  IMAGE: "image",
  DATE: "date",
  DATE_RANGE: "dateRange",
  TABLE: "table",
  CARD: "card",
};

async function seed() {
  try {
    await prisma.template.deleteMany();

    const templates = [
      {
        id: 1,
        name: "现代个人简历",
        description: "优雅现代的个人简历设计",
        thumbnail: "/templates/modern-resume.jpg",
        category: "personal",
        keywords: JSON.stringify(["简历", "求职", "个人介绍", "工作经历", "技能展示", "自我介绍"]),
        content: {
          boxes: [
            {
              id: 1,
              positionX: 0,
              positionY: 0,
              width: "100%",
              order: 0,
              sortOrder: 0,
              layout: {
                columns: 3,
              },
              components: [
                {
                  id: 2,
                  type: COMPONENT_TYPES.IMAGE,
                  width: "100%",
                  height: 220,
                  props: {
                    src: "http://localhost:3000/seed/profile-pic.jpg",
                    style: {
                      borderRadius: "12px",
                      margin: "16px 0",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    },
                  },
                  imageId: 1,
                  column: 1,
                },
              ],
            },
            {
              id: 2,
              positionX: 0,
              positionY: 240,
              width: "100%",
              order: 1,
              sortOrder: 1,
              layout: {
                columns: 1,
              },
              components: [
                {
                  id: 1,
                  type: COMPONENT_TYPES.CARD,
                  width: "100%",
                  height: 140,
                  props: {
                    title: "李明",
                    content: "138-1234-5678 | liming@example.com | 上海",
                    backgroundColor: "linear-gradient(135deg, #4b5563, #d1d5db)",
                    style: {
                      color: "#1f2937", 
                      padding: "20px",
                    },
                  },
                  imageId: null,
                  column: 0,
                },
              ],
            },
            {
              id: 3,
              positionX: 0,
              positionY: 380,
              width: "100%",
              order: 2,
              sortOrder: 2,
              layout: {
                columns: 1,
              },
              components: [
                {
                  id: 4,
                  type: COMPONENT_TYPES.CARD,
                  width: "100%",
                  height: 160,
                  props: {
                    title: "技能",
                    content: "- React\n- TypeScript\n- Node.js\n- Python\n- UI/UX",
                    backgroundColor: "#f9fafb",
                    style: {
                      color: "#1f2937",
                      fontSize: "14px",
                      padding: "16px",
                      marginBottom: "16px",
                      borderRadius: "8px",
                      whiteSpace: "pre-line",
                    },
                  },
                  imageId: null,
                  column: 0,
                },
              ],
            },
            {
              id: 4,
              positionX: 0,
              positionY: 692,
              width: "100%",
              layout: {
                columns: 1,
              },
              components: [
                {
                  id: 5,
                  type: COMPONENT_TYPES.CARD,
                  width: "100%",
                  height: 160,
                  props: {
                    title: "工作经验",
                    content: "ABC科技，前端开发，2023至今\n- 开发响应式Web应用\n- 优化性能提升30%",
                    backgroundColor: "#f3f4f6",
                    style: {
                      fontSize: "14px",
                      color: "#4b5563",
                      padding: "16px",
                      borderRadius: "8px",
                      whiteSpace: "pre-line",
                    },
                  },
                  imageId: null,
                  column: 0,
                },
              ],
            },
          ],
        },
      },
      {
        id: 2,
        name: "时尚产品展示",
        description: "现代化的产品介绍页面",
        thumbnail: "/templates/product-showcase.jpg",
        category: "business",
        keywords: JSON.stringify(["产品展示", "商品展示", "产品介绍", "商品详情", "产品展示页"]),
        content: {
          boxes: [
            {
              id: 3,
              positionX: 0,
              positionY: 0,
              width: "100%",
              order: 0,
              components: [
                {
                  id: 6,
                  type: COMPONENT_TYPES.IMAGE,
                  width: "100%",
                  height: 320,
                  props: {
                    src: "http://localhost:3000/seed/product-hero.jpg",
                    style: { borderRadius: "12px", boxShadow: "0 6px 12px rgba(0,0,0,0.15)" },
                  },
                  imageId: 2,
                },
              ],
            },
            {
              id: 4,
              positionX: 0,
              positionY: 340,
              width: "100%",
              components: [
                {
                  id: 7,
                  type: COMPONENT_TYPES.TEXT,
                  width: "100%",
                  height: 80,
                  props: {
                    content: "智能手表 Pro",
                    style: { fontSize: "32px", color: "#dc2626", fontWeight: "bold", textAlign: "center" },
                  },
                  imageId: null,
                },
                {
                  id: 8,
                  type: COMPONENT_TYPES.TEXT,
                  width: "100%",
                  height: 100,
                  props: {
                    content: "下一代智能穿戴设备，健康与科技的完美结合",
                    style: { fontSize: "16px", color: "#6b7280", textAlign: "center", padding: "16px" },
                  },
                  imageId: null,
                },
                {
                  id: 9,
                  type: COMPONENT_TYPES.BUTTON,
                  width: "160px",
                  height: 50,
                  props: {
                    content: "立即购买",
                    style: {
                      backgroundColor: "#dc2626",
                      color: "#fff",
                      borderRadius: "10px",
                      fontSize: "16px",
                      margin: "0 auto",
                      display: "block",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    },
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
        name: "商业计划书模板",
        description: "优雅的商业展示模板",
        thumbnail: "/templates/business-plan.jpg",
        category: "business",
        keywords: JSON.stringify(["商业计划", "创业计划", "项目计划", "商业展示", "企业规划"]),
        content: {
          boxes: [
            {
              id: 5,
              positionX: 0,
              positionY: 0,
              width: "100%",
              components: [
                {
                  id: 10,
                  type: COMPONENT_TYPES.TEXT,
                  width: "100%",
                  height: 100,
                  props: {
                    content: "商业计划书 2025",
                    style: { fontSize: "36px", color: "#2c3e50", fontWeight: "bold", textAlign: "center" },
                  },
                  imageId: null,
                },
                {
                  id: 11,
                  type: COMPONENT_TYPES.CARD,
                  width: "100%",
                  height: 180,
                  props: {
                    title: "公司愿景",
                    content: "引领技术创新，改变世界",
                    imageSrc: "http://localhost:3000/seed/vision.jpg",
                    style: {
                      backgroundColor: "#f9fafb",
                      borderRadius: "12px",
                      padding: "20px",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    },
                  },
                  imageId: 3,
                },
              ],
            },
            {
              id: 6,
              positionX: 0,
              positionY: 300,
              width: "100%",
              components: [
                {
                  id: 12,
                  type: COMPONENT_TYPES.TABLE,
                  width: "100%",
                  height: 200,
                  props: {
                    rows: 4,
                    columns: 3,
                    data: [
                      ["阶段", "收入目标", "用户数"],
                      ["Q1 2025", "$1M", "10K"],
                      ["Q2 2025", "$3M", "25K"],
                      ["Q4 2025", "$5M", "50K"],
                    ],
                    style: { border: "1px solid #e5e7eb", backgroundColor: "#ffffff", fontSize: "14px" },
                  },
                  imageId: null,
                },
                {
                  id: 13,
                  type: COMPONENT_TYPES.BUTTON,
                  width: "180px",
                  height: 50,
                  props: {
                    content: "下载完整计划",
                    style: {
                      backgroundColor: "#3498db",
                      color: "#fff",
                      borderRadius: "10px",
                      margin: "20px auto 0",
                      display: "block",
                    },
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
        description: "简洁的教学演示页面",
        thumbnail: "/templates/education.jpg",
        category: "education",
        keywords: JSON.stringify(["教育", "教学", "课程", "学习", "培训", "课件"]),
        content: {
          boxes: [
            {
              id: 7,
              positionX: 0,
              positionY: 0,
              width: "100%",
              components: [
                {
                  id: 14,
                  type: COMPONENT_TYPES.TEXT,
                  width: "100%",
                  height: 100,
                  props: {
                    content: "现代教育技术",
                    style: { fontSize: "36px", color: "#27ae60", fontWeight: "bold", textAlign: "center" },
                  },
                  imageId: null,
                },
                {
                  id: 15,
                  type: COMPONENT_TYPES.IMAGE,
                  width: "100%",
                  height: 260,
                  props: {
                    src: "http://localhost:3000/seed/education-tech.jpg",
                    style: { borderRadius: "12px", margin: "16px 0", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" },
                  },
                  imageId: 4,
                },
              ],
            },
            {
              id: 8,
              positionX: 0,
              positionY: 380,
              width: "100%",
              components: [
                {
                  id: 16,
                  type: COMPONENT_TYPES.TEXT,
                  width: "100%",
                  height: 120,
                  props: {
                    content: "互动 | 个性化 | 高效\n未来的学习方式",
                    style: { fontSize: "16px", color: "#4b5563", textAlign: "center", padding: "16px" },
                  },
                  imageId: null,
                },
                {
                  id: 17,
                  type: COMPONENT_TYPES.BUTTON,
                  width: "160px",
                  height: 50,
                  props: {
                    content: "下一页",
                    style: {
                      backgroundColor: "#27ae60",
                      color: "#fff",
                      borderRadius: "10px",
                      margin: "0 auto",
                      display: "block",
                    },
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
        description: "简约的公司介绍页面",
        thumbnail: "/templates/company-profile.jpg",
        category: "business",
        keywords: JSON.stringify(["公司介绍", "企业简介", "关于我们", "企业展示", "公司展示"]),
        content: {
          boxes: [
            {
              id: 9,
              positionX: 0,
              positionY: 0,
              width: "100%",
              components: [
                {
                  id: 18,
                  type: COMPONENT_TYPES.TEXT,
                  width: "100%",
                  height: 100,
                  props: {
                    content: "关于我们",
                    style: { fontSize: "36px", color: "#8e44ad", fontWeight: "bold", textAlign: "center" },
                  },
                  imageId: null,
                },
                {
                  id: 19,
                  type: COMPONENT_TYPES.IMAGE,
                  width: "100%",
                  height: 260,
                  props: {
                    src: "http://localhost:3000/seed/team-photo.jpg",
                    style: { borderRadius: "12px", margin: "16px 0", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" },
                  },
                  imageId: 5,
                },
              ],
            },
            {
              id: 10,
              positionX: 0,
              positionY: 380,
              width: "100%",
              components: [
                {
                  id: 20,
                  type: COMPONENT_TYPES.CARD,
                  width: "100%",
                  height: 180,
                  props: {
                    title: "我们的使命",
                    content: "提供卓越的技术解决方案，赋能未来",
                    imageSrc: "http://localhost:3000/seed/mission.jpg",
                    style: {
                      backgroundColor: "#f9fafb",
                      borderRadius: "12px",
                      padding: "20px",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    },
                  },
                  imageId: 6,
                },
                {
                  id: 21,
                  type: COMPONENT_TYPES.BUTTON,
                  width: "160px",
                  height: 50,
                  props: {
                    content: "联系我们",
                    style: {
                      backgroundColor: "#8e44ad",
                      color: "#fff",
                      borderRadius: "10px",
                      margin: "20px auto 0",
                      display: "block",
                    },
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
        keywords: JSON.stringify(["博客", "文章", "个人博客", "内容展示", "文章列表"]),
        content: {
          boxes: [
            {
              id: 11,
              positionX: 0,
              positionY: 0,
              width: "100%",
              components: [
                {
                  id: 22,
                  type: COMPONENT_TYPES.IMAGE,
                  width: "100%",
                  height: 300,
                  props: {
                    src: "http://localhost:3000/seed/sunny-day.jpg",
                    style: { borderRadius: "12px", boxShadow: "0 6px 12px rgba(0,0,0,0.15)" },
                  },
                  imageId: 7,
                },
              ],
            },
            {
              id: 12,
              positionX: 0,
              positionY: 320,
              width: "100%",
              components: [
                {
                  id: 23,
                  type: COMPONENT_TYPES.TEXT,
                  width: "100%",
                  height: 80,
                  props: {
                    content: "美好一天",
                    style: { fontSize: "32px", color: "#f1c40f", fontWeight: "bold", textAlign: "center" },
                  },
                  imageId: null,
                },
                {
                  id: 24,
                  type: COMPONENT_TYPES.TEXT,
                  width: "100%",
                  height: 120,
                  props: {
                    content: "阳光明媚，心情愉快，记录生活的点滴",
                    style: { fontSize: "16px", color: "#6b7280", textAlign: "center", padding: "16px" },
                  },
                  imageId: null,
                },
                {
                  id: 25,
                  type: COMPONENT_TYPES.BUTTON,
                  width: "160px",
                  height: 50,
                  props: {
                    content: "阅读更多",
                    style: {
                      backgroundColor: "#f1c40f",
                      color: "#fff",
                      borderRadius: "10px",
                      margin: "0 auto",
                      display: "block",
                    },
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
        keywords: JSON.stringify(["笔记", "课堂笔记", "学习笔记", "笔记模板", "课程笔记"]),
        content: {
          boxes: [
            {
              id: 13,
              positionX: 0,
              positionY: 0,
              width: "100%",
              components: [
                {
                  id: 26,
                  type: COMPONENT_TYPES.TEXT,
                  width: "100%",
                  height: 100,
                  props: {
                    content: "现代物理学笔记",
                    style: { fontSize: "32px", color: "#d35400", fontWeight: "bold", textAlign: "center" },
                  },
                  imageId: null,
                },
                {
                  id: 27,
                  type: COMPONENT_TYPES.TEXT,
                  width: "100%",
                  height: 140,
                  props: {
                    content: "1. 量子力学\n2. 相对论\n3. 热力学",
                    style: { fontSize: "16px", color: "#4b5563", textAlign: "left", padding: "16px" },
                  },
                  imageId: null,
                },
              ],
            },
            {
              id: 14,
              positionX: 0,
              positionY: 260,
              width: "100%",
              components: [
                {
                  id: 28,
                  type: COMPONENT_TYPES.CHECKBOX,
                  width: "100%",
                  height: 100,
                  props: {
                    label: "任务",
                    options: ["复习", "作业", "实验"],
                    selected: ["复习"],
                    style: { color: "#d35400", fontSize: "14px", padding: "16px" },
                  },
                  imageId: null,
                },
                {
                  id: 29,
                  type: COMPONENT_TYPES.BUTTON,
                  width: "160px",
                  height: 50,
                  props: {
                    content: "保存笔记",
                    style: {
                      backgroundColor: "#d35400",
                      color: "#fff",
                      borderRadius: "10px",
                      margin: "0 auto",
                      display: "block",
                    },
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
        keywords: JSON.stringify(["营销", "推广", "营销计划", "市场推广", "营销方案"]),
        content: {
          boxes: [
            {
              id: 15,
              positionX: 0,
              positionY: 0,
              width: "100%",
              components: [
                {
                  id: 30,
                  type: COMPONENT_TYPES.TEXT,
                  width: "100%",
                  height: 100,
                  props: {
                    content: "2025 营销计划",
                    style: { fontSize: "36px", color: "#c0392b", fontWeight: "bold", textAlign: "center" },
                  },
                  imageId: null,
                },
                {
                  id: 31,
                  type: COMPONENT_TYPES.IMAGE,
                  width: "100%",
                  height: 240,
                  props: {
                    src: "http://localhost:3000/seed/marketing-strategy.jpg",
                    style: { borderRadius: "12px", margin: "16px 0", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" },
                  },
                  imageId: 8,
                },
              ],
            },
            {
              id: 16,
              positionX: 0,
              positionY: 360,
              width: "100%",
              components: [
                {
                  id: 32,
                  type: COMPONENT_TYPES.TABLE,
                  width: "100%",
                  height: 200,
                  props: {
                    rows: 4,
                    columns: 3,
                    data: [
                      ["目标", "策略", "预算"],
                      ["销量增长", "促销活动", "$50K"],
                      ["品牌知名度", "社交媒体", "$30K"],
                      ["客户留存", "会员计划", "$20K"],
                    ],
                    style: { border: "1px solid #e5e7eb", backgroundColor: "#ffffff", fontSize: "14px" },
                  },
                  imageId: null,
                },
                {
                  id: 33,
                  type: COMPONENT_TYPES.BUTTON,
                  width: "160px",
                  height: 50,
                  props: {
                    content: "执行计划",
                    style: {
                      backgroundColor: "#c0392b",
                      color: "#fff",
                      borderRadius: "10px",
                      margin: "20px auto 0",
                      display: "block",
                    },
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
        keywords: JSON.stringify(["日记", "个人日记", "生活记录", "心情记录", "日记本"]),
        content: {
          boxes: [
            {
              id: 17,
              positionX: 0,
              positionY: 0,
              width: "100%",
              components: [
                {
                  id: 34,
                  type: COMPONENT_TYPES.DATE,
                  width: "220px",
                  height: 50,
                  props: {
                    value: "2025-03-11",
                    style: {
                      fontSize: "16px",
                      color: "#16a085",
                      borderRadius: "8px",
                      margin: "0 auto",
                      display: "block",
                    },
                  },
                  imageId: null,
                },
                {
                  id: 35,
                  type: COMPONENT_TYPES.IMAGE,
                  width: "100%",
                  height: 260,
                  props: {
                    src: "http://localhost:3000/seed/diary-moment.jpg",
                    style: { borderRadius: "12px", margin: "16px 0", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" },
                  },
                  imageId: 9,
                },
              ],
            },
            {
              id: 18,
              positionX: 0,
              positionY: 340,
              width: "100%",
              components: [
                {
                  id: 36,
                  type: COMPONENT_TYPES.TEXT,
                  width: "100%",
                  height: 140,
                  props: {
                    content: "今天阳光明媚，心情很好，去了公园散步，感受大自然的美好。",
                    style: { fontSize: "16px", color: "#4b5563", textAlign: "left", padding: "16px" },
                  },
                  imageId: null,
                },
                {
                  id: 37,
                  type: COMPONENT_TYPES.RADIO,
                  width: "100%",
                  height: 100,
                  props: {
                    label: "今日心情",
                    options: ["开心", "平静", "疲惫"],
                    selected: "开心",
                    style: { color: "#16a085", fontSize: "14px", padding: "16px" },
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
        keywords: JSON.stringify(["课程表", "课表", "课程安排", "学习计划", "课程规划"]),
        content: {
          boxes: [
            {
              id: 19,
              positionX: 0,
              positionY: 0,
              width: "100%",
              components: [
                {
                  id: 38,
                  type: COMPONENT_TYPES.TEXT,
                  width: "100%",
                  height: 100,
                  props: {
                    content: "本周课程表",
                    style: { fontSize: "36px", color: "#2980b9", fontWeight: "bold", textAlign: "center" },
                  },
                  imageId: null,
                },
                {
                  id: 39,
                  type: COMPONENT_TYPES.TABLE,
                  width: "100%",
                  height: 240,
                  props: {
                    rows: 6,
                    columns: 3,
                    data: [
                      ["时间", "课程", "教室"],
                      ["09:00-10:00", "数学", "A101"],
                      ["10:30-11:30", "英语", "B202"],
                      ["13:00-14:00", "物理", "C303"],
                      ["14:30-15:30", "编程", "D404"],
                      ["16:00-17:00", "体育", "操场"],
                    ],
                    style: { border: "1px solid #d1d5db", backgroundColor: "#f9fafb", fontSize: "14px" },
                  },
                  imageId: null,
                },
              ],
            },
            {
              id: 20,
              positionX: 0,
              positionY: 360,
              width: "100%",
              components: [
                {
                  id: 40,
                  type: COMPONENT_TYPES.DATE_RANGE,
                  width: "260px",
                  height: 50,
                  props: {
                    start: "2025-03-11",
                    end: "2025-03-17",
                    style: { fontSize: "14px", color: "#2980b9", margin: "0 auto", display: "block" },
                  },
                  imageId: null,
                },
                {
                  id: 41,
                  type: COMPONENT_TYPES.BUTTON,
                  width: "160px",
                  height: 50,
                  props: {
                    content: "导出课程",
                    style: {
                      backgroundColor: "#2980b9",
                      color: "#fff",
                      borderRadius: "10px",
                      margin: "20px auto 0",
                      display: "block",
                    },
                  },
                  imageId: null,
                },
              ],
            },
          ],
        },
      },
    ];

    await prisma.template.createMany({ data: templates });
  } catch (error) {
    console.error("插入数据失败:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
