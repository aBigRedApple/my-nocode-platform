import { Inter } from "next/font/google";
import type { Metadata } from "next";
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "无代码平台",
  description: "一个简单易用的无代码开发平台",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={inter.className}>
      <body className="bg-gray-100 font-sans h-full flex flex-col">
        <ClientLayout>{children}</ClientLayout>
        <Toaster 
          position="top-right"
          duration={2000}
          closeButton
          richColors
          expand={false}
          style={{ fontSize: '14px' }}
        />
      </body>
    </html>
  );
}
