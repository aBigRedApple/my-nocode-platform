const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seed() {
  try {
    await prisma.template.deleteMany();
    console.log("已清空模板表");

    const templates = [
      {
        name: "商业计划书模板",
        description: "适用于创业公司和商业展示的专业模板",
        thumbnail: "/templates/business-plan.jpg",
        category: "business",
      },
      {
        name: "个人简历模板",
        description: "简洁优雅的个人简历设计",
        thumbnail: "/templates/resume.jpg",
        category: "personal",
      },
      {
        name: "教育演示模板",
        description: "适合课堂教学和学术报告",
        thumbnail: "/templates/education.jpg",
        category: "education",
      },
      {
        name: "公司简介模板",
        description: "展示公司文化和业务的最佳选择",
        thumbnail: "/templates/company-profile.jpg",
        category: "business",
      },
      {
        name: "个人博客模板",
        description: "记录生活点滴的个性化模板",
        thumbnail: "/templates/blog.jpg",
        category: "personal",
      },
      {
        name: "课堂笔记模板",
        description: "学生和教师的理想笔记工具",
        thumbnail: "/templates/notes.jpg",
        category: "education",
      },
      {
        name: "营销计划模板",
        description: "助力营销活动的专业模板",
        thumbnail: "/templates/marketing.jpg",
        category: "business",
      },
      {
        name: "日记模板",
        description: "简单实用的每日记录模板",
        thumbnail: "/templates/diary.jpg",
        category: "personal",
      },
      {
        name: "课程表模板",
        description: "清晰规划课程时间的模板",
        thumbnail: "/templates/schedule.jpg",
        category: "education",
      },
      {
        name: "项目提案模板",
        description: "用于项目提案的专业设计",
        thumbnail: "/templates/proposal.jpg",
        category: "business",
      },
    ];

    await prisma.template.createMany({ data: templates });
    console.log("模板数据已成功插入数据库");
  } catch (error) {
    console.error("插入数据失败:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();