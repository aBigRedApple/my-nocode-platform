"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/components/AuthContext";
import Navbar from "@/components/Navbar";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import AIAssistant from "@/components/AIAssistant";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isEditorPage = pathname ? /^\/editor\/\d+$/.test(pathname) : false;

  return (
    <AuthProvider>
      <ConfigProvider locale={zhCN}>
        {!isEditorPage && <Navbar />}
        <main className="flex-1 overflow-y-auto">{children}</main>
        <AIAssistant />
      </ConfigProvider>
    </AuthProvider>
  );
}
