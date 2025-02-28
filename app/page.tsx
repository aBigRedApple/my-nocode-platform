import Link from "next/link"; // 引入 Link 组件

export default function Home() {
  return (
    <div>
      {/* 首屏 */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-32 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-6xl font-bold mb-6">无需代码，轻松构建你的应用</h1>
          <p className="mt-4 text-xl">
            通过拖拽式界面，快速创建网页、应用和工作流。支持模板中心、协作空间、AI
            助手和个人空间，让每个人都能轻松实现创意。
          </p>
          <div className="mt-8">
            <Link
              href="/workspace"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition duration-300"
            >
              立即开始
            </Link>
          </div>
        </div>
      </section>

      {/* 核心功能 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">核心功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* 模板中心 */}
            <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-5xl mb-4">📂</div>
              <h3 className="text-2xl font-bold mb-4">模板中心</h3>
              <p className="text-gray-600">创建、分享和售卖你的模板，或从社区获取灵感。</p>
            </div>

            {/* 协作空间 */}
            <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-2xl font-bold mb-4">协作空间</h3>
              <p className="text-gray-600">与团队成员实时协作，提升开发效率。</p>
            </div>

            {/* AI 助手 */}
            <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold mb-4">AI 助手</h3>
              <p className="text-gray-600">利用 AI 生成代码、优化设计和提供建议。</p>
            </div>

            {/* 个人空间 */}
            <div className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-5xl mb-4">💼</div>
              <h3 className="text-2xl font-bold mb-4">个人空间</h3>
              <p className="text-gray-600">管理你的项目、模板和资源，随时随地访问。</p>
            </div>
          </div>
        </div>
      </section>

      {/* 平台优势 */}
      <section className="py-20 bg-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">平台优势</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg">
              <h3 className="text-2xl font-bold mb-4">无需编码</h3>
              <p className="text-gray-600">通过简单的拖拽操作，即可快速创建功能丰富的应用，无需编写代码。</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg">
              <h3 className="text-2xl font-bold mb-4">高效协作</h3>
              <p className="text-gray-600">支持团队成员间实时协作，大大提升开发效率和项目管理能力。</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg">
              <h3 className="text-2xl font-bold mb-4">AI 助力</h3>
              <p className="text-gray-600">内置强大的 AI 助手，自动生成代码，优化设计，让开发更轻松。</p>
            </div>
          </div>
        </div>
      </section>

      {/* 统计数字 */}
      <section className="py-20 bg-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">我们的平台影响力</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-3xl font-bold text-blue-600 mb-4">1000+</h3>
              <p className="text-gray-600">模板发布</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-3xl font-bold text-blue-600 mb-4">500+</h3>
              <p className="text-gray-600">团队合作</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-3xl font-bold text-blue-600 mb-4">10K+</h3>
              <p className="text-gray-600">注册用户</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-3xl font-bold text-blue-600 mb-4">500+</h3>
              <p className="text-gray-600">成功项目</p>
            </div>
          </div>
        </div>
      </section>

      {/* 常见问题 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">常见问题</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">如何开始使用这个平台？</h3>
              <p className="text-gray-600 mt-4">
                您只需注册并选择一个模板开始，平台提供拖拽式的界面，您无需编写任何代码即可创建应用。
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">AI 助手如何帮助我？</h3>
              <p className="text-gray-600 mt-4">AI 助手可以自动生成代码、提供设计优化建议，甚至帮助你解决技术难题。</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">如何与团队成员进行协作？</h3>
              <p className="text-gray-600 mt-4">
                您可以通过平台内的协作空间与团队成员实时合作，所有成员可以在同一项目中同时工作。
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">我的数据安全吗？</h3>
              <p className="text-gray-600 mt-4">
                我们采取了行业领先的安全措施来保护您的数据，确保平台上的信息得到高度保护。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 用户评价展示 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">用户评价</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* 用户评价卡片 */}
            <div className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <p className="text-gray-600 italic">“这个平台彻底改变了我们的开发流程，节省了大量时间和成本！”</p>
              <p className="mt-4 font-bold text-gray-900">—— 张三，XX公司产品经理</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <p className="text-gray-600 italic">“即使没有技术背景，我也能轻松构建出专业的应用。”</p>
              <p className="mt-4 font-bold text-gray-900">—— 李四，自由职业者</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <p className="text-gray-600 italic">“AI 助手功能太强大了，帮我解决了很多技术难题。”</p>
              <p className="mt-4 font-bold text-gray-900">—— 王五，开发者</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <p className="text-gray-600 italic">“协作空间让团队沟通更加高效，项目进展一目了然。”</p>
              <p className="mt-4 font-bold text-gray-900">—— 赵六，项目经理</p>
            </div>
          </div>
        </div>
      </section>
      <footer className="py-6 bg-gray-800 text-white text-center">
        <p>© 2025 无代码平台. All rights reserved.</p>
      </footer>
    </div>
  );
}
