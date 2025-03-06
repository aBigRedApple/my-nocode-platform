"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/components/AuthContext";
import "./globals.css";
import Navbar from "@/components/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 使用正则匹配 "/editor/任意id"
  const isEditorPage = /^\/editor\/\d+$/.test(pathname);

  return (
    <html lang="zh-CN" className="h-full">
      <body className="bg-gray-100 font-sans h-full flex flex-col">
        <AuthProvider>
          {/* 只有不是 /editor/[id] 时，才渲染 Navbar */}
          {!isEditorPage && <Navbar />}

          {/* 页面内容 */}
          <main className="flex-1 overflow-y-auto">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
