import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* 渐变Hero区域 */}
      <section className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 py-48 text-white text-center">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">无代码开发平台</h1>
          <p className="text-xl sm:text-2xl max-w-3xl mx-auto opacity-95 mb-8">
            通过可视化工作区、智能AI助手和丰富模板市场，快速构建企业级应用
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/workspace"
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-gray-50 transition-all"
            >
              🚀 立即开始
            </Link>
            <Link
              href="/marketplace"
              className="border-2 border-white/30 px-8 py-3 rounded-full hover:bg-white/10 transition-all"
            >
              🧩 探索模板
            </Link>
          </div>
        </div>
      </section>

      {/* 核心功能矩阵 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">核心功能</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "智能工作区",
                desc: "可视化组件编排与实时协作",
                icon: "💻",
                link: "/workspace",
                color: "bg-blue-100",
              },
              {
                title: "模板市场",
                desc: "海量可编辑行业模板",
                icon: "🛍️",
                link: "/marketplace",
                color: "bg-purple-100",
              },
              {
                title: "AI助手",
                desc: "生成可编辑业务模板",
                icon: "🤖",
                link: "/ai",
                color: "bg-indigo-100",
              },
              {
                title: "个人中心",
                desc: "项目管理与资产沉淀",
                icon: "📁",
                link: "/profile",
                color: "bg-pink-100",
              },
            ].map((item, index) => (
              <Link
                key={index}
                href={item.link}
                className={`${item.color} p-6 rounded-xl hover:shadow-lg transition-all`}
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AI模板生成演示 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold mb-8">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
                  AI模板引擎
                </span>
                <br />
                三步生成可编辑模板
              </h2>
              <div className="space-y-6">
                {[
                  {
                    step: "1. 描述需求",
                    desc: "用自然语言说明需要的功能",
                    example: "我需要一个电商商品管理后台，包含分类、库存和订单管理",
                  },
                  {
                    step: "2. AI智能生成",
                    desc: "自动生成完整可编辑模板",
                    example: "生成包含表格、表单和图表的模板",
                  },
                  {
                    step: "3. 可视化编辑",
                    desc: "在工作区自由调整组件",
                    example: "拖拽修改布局/添加新功能",
                  },
                ].map((item, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="text-xl font-bold mb-2">{item.step}</h3>
                    <p className="text-gray-600 mb-2">{item.desc}</p>
                    <div className="text-sm bg-gray-50 p-3 rounded-lg">📌 示例：{item.example}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI交互演示 */}
            <div className="lg:w-1/2 bg-gray-800 rounded-xl p-6 shadow-2xl">
              <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="space-y-4 text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">▶</span>
                  <span>正在生成「电商后台」模板...</span>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-blue-400">生成的模板包含：</div>
                  <ul className="list-disc pl-6 mt-2">
                    <li>商品分类管理组件</li>
                    <li>库存实时追踪表格</li>
                    <li>订单可视化图表</li>
                  </ul>
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg transition-all">
                  进入工作区编辑
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-indigo-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">
            用户评价
            <span className="block text-xl font-normal mt-4 text-gray-600">来自全球开发者的真实反馈</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "张伟",
                role: "产品经理 @ TechCorp",
                quote: "彻底改变了我们的开发流程，现在原型设计效率提升了300%",
                avatar: "👨💼",
              },
              {
                name: "Sarah Johnson",
                role: "CTO @ StartUpHub",
                quote: "AI生成模板的质量超出预期，节省了大量重复工作",
                avatar: "👩💻",
              },
              {
                name: "王敏",
                role: "全栈开发者",
                quote: "组件化设计让团队协作变得前所未有的顺畅",
                avatar: "👩🔧",
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">{testimonial.avatar}</div>
                <blockquote className="text-gray-600 italic mb-6">“{testimonial.quote}”</blockquote>
                <div className="border-t pt-4">
                  <h3 className="font-bold text-lg">{testimonial.name}</h3>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 标准化页脚 */}
      <footer className="bg-gray-800 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold mb-4">产品服务</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/workspace" className="hover:text-white transition">
                  工作区
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-white transition">
                  模板市场
                </Link>
              </li>
              <li>
                <Link href="/ai" className="hover:text-white transition">
                  AI助手
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">资源中心</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="hover:text-white transition">
                  开发文档
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  视频教程
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  成功案例
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">技术支持</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="hover:text-white transition">
                  联系我们
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  系统状态
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  问题反馈
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">关注我们</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="hover:text-white transition">
                  技术博客
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  Twitter
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition">
                  微信公众号
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-700 text-center">
          <p className="text-sm">
            © 2024 NoCodeX Platform. All rights reserved.
            <span className="mx-4">|</span>
            <Link href="#" className="hover:text-white">
              隐私政策
            </Link>
            <span className="mx-4">|</span>
            <Link href="#" className="hover:text-white">
              服务条款
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
