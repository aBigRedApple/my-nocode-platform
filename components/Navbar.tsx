"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 控制菜单展开

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth(); // 页面加载时检查

    // 定期检查 localStorage 更新
    const intervalId = setInterval(checkAuth, 1000); // 每秒检查一次

    window.addEventListener("storage", checkAuth); // 监听 localStorage 变化

    return () => {
      clearInterval(intervalId); // 清除定时器
      window.removeEventListener("storage", checkAuth); // 移除事件监听器
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null); // 强制更新用户状态
  };

  const navLinks = useMemo(
    () => [
      { name: "首页", href: "/" },
      { name: "工作区", href: "/workspace" },
      { name: "模板市场", href: "/marketplace" },
      { name: "个人中心", href: "/profile" },
    ],
    []
  );

  return (
    <header className="bg-white py-4 fixed w-full z-10 top-0 left-0 shadow-lg" style={{ height: "64px" }}>
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
        {/* 适应屏幕大小的标题 */}
        <h1 className="text-2xl sm:text-xl md:text-2xl font-bold text-blue-600">无代码平台</h1>

        {/* 导航按钮（在小屏幕下显示） */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="block sm:hidden text-2xl text-blue-600"
        >
          {isMenuOpen ? "×" : "≡"}
        </button>

        {/* 导航链接，响应式处理 */}
        <nav
          className={`${
            isMenuOpen ? "block" : "hidden"
          } sm:flex sm:space-x-6 text-blue-600 sm:block`}
        >
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <span
                className={`${
                  pathname === link.href ? "text-indigo-600 font-semibold" : "hover:text-indigo-600"
                } hover:font-semibold hover:shadow-md transition duration-200 text-sm sm:text-base md:text-lg`}
              >
                {link.name}
              </span>
            </Link>
          ))}

          {/* 登录或退出按钮 */}
          {user ? (
            <div className="inline-flex space-x-4">
              <span className="text-indigo-600 font-semibold text-sm sm:text-base">{`Hi, ${user.name}`}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-blue-600 text-white font-medium rounded-lg border border-blue-500 shadow-sm transition-all duration-300 hover:bg-blue-700 hover:shadow-md active:scale-95 text-sm sm:text-base"
              >
                退出
              </button>
            </div>
          ) : (
            <>
              <div className="hidden sm:inline-block">
                <Link href="/auth/login">
                  <span
                    className={`${
                      pathname === "/auth/login" ? "text-indigo-600 font-semibold" : "hover:text-indigo-600"
                    } hover:font-semibold hover:shadow-md transition duration-200 text-sm sm:text-base md:text-lg`}
                  >
                    登录
                  </span>
                </Link>
                <Link href="/auth/register">
                  <span
                    className={`${
                      pathname === "/auth/register" ? "text-indigo-600 font-semibold" : "hover:text-indigo-600"
                    } hover:font-semibold hover:shadow-md transition duration-200 text-sm sm:text-base md:text-lg`}
                  >
                    注册
                  </span>
                </Link>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
