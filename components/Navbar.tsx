"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "./AuthContext";

const Navbar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.info("已退出登录");
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
      <ToastContainer />
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
        {/* 标题 */}
        <h1 className="text-2xl sm:text-xl md:text-2xl font-bold text-blue-600">无代码平台</h1>

        {/* 导航按钮（小屏幕） */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="block sm:hidden text-2xl text-blue-600"
        >
          {isMenuOpen ? "×" : "≡"}
        </button>

        {/* 导航链接 */}
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
              <span className="text-indigo-600 font-semibold text-sm sm:text-base">{user.name}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-blue-600 text-white font-medium rounded-lg border border-blue-500 shadow-sm transition-all duration-300 hover:bg-blue-700 hover:shadow-md active:scale-95 text-sm sm:text-base"
              >
                退出
              </button>
            </div>
          ) : (
            <div className="hidden sm:inline-block space-x-8">
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
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;