"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import { Modal, Button } from "antd";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  const handlePreLogout = () => {
    setIsLogoutModalVisible(true);
  };

  const handleLogout = () => {
    logout();
    setIsLogoutModalVisible(false);
    router.push("/auth/login");
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
    <header className="bg-white fixed w-full z-10 top-0 left-0 shadow-md h-16">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 h-full">
        {/* 标题 */}
        <h1 className="text-xl md:text-2xl font-bold text-blue-600 transition-all duration-300">
          NoCodeX
        </h1>

        {/* 导航按钮（小屏幕） */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="block sm:hidden text-2xl text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"
        >
          {isMenuOpen ? "×" : "≡"}
        </button>

        {/* 导航链接 */}
        <nav
          className={`${
            isMenuOpen ? "flex" : "hidden"
          } sm:flex flex-col sm:flex-row absolute sm:relative top-16 sm:top-0 left-0 right-0 bg-white sm:bg-transparent shadow-lg sm:shadow-none space-y-2 sm:space-y-0 sm:space-x-6 text-blue-600 p-4 sm:p-0 sm:items-center`}
          style={{ zIndex: 50 }}
        >
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <span
                className={`${
                  pathname === link.href
                    ? "text-indigo-600 font-semibold border-b-2 border-indigo-600"
                    : "hover:text-indigo-600 hover:font-semibold"
                } transition-all duration-200 text-sm sm:text-base md:text-lg inline-block py-2 px-1 sm:px-3`}
              >
                {link.name}
              </span>
            </Link>
          ))}

          {/* 登录或退出按钮 */}
          {user ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mt-2 sm:mt-0">
              <span className="text-indigo-600 font-semibold text-sm sm:text-base whitespace-nowrap">
                Hi! {user.name}
              </span>
              <button
                onClick={handlePreLogout}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-sm transition-all duration-300 hover:bg-blue-700 hover:shadow-md active:scale-95 text-sm sm:text-base"
              >
                退出
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-2 sm:mt-0">
              <Link href="/auth/login">
                <span
                  className={`${
                    pathname === "/auth/login"
                      ? "text-indigo-600 font-semibold border-b-2 border-indigo-600"
                      : "hover:text-indigo-600 hover:font-semibold"
                  } transition-all duration-200 text-sm sm:text-base md:text-lg inline-block py-2 px-1 sm:px-3`}
                >
                  登录
                </span>
              </Link>
              <Link href="/auth/register">
                <span
                  className={`${
                    pathname === "/auth/register"
                      ? "text-indigo-600 font-semibold border-b-2 border-indigo-600"
                      : "hover:text-indigo-600 hover:font-semibold"
                  } transition-all duration-200 text-sm sm:text-base md:text-lg inline-block py-2 px-1 sm:px-3`}
                >
                  注册
                </span>
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        title="确认退出登录"
        open={isLogoutModalVisible}
        centered
        onCancel={() => setIsLogoutModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsLogoutModalVisible(false)}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            onClick={handleLogout}
            className="shadow-sm"
          >
            确认退出
          </Button>,
        ]}
      >
        <p className="py-4 text-gray-600">确定要退出登录吗？</p>
      </Modal>
    </header>
  );
};

export default Navbar;