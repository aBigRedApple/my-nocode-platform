import './globals.css';
import Navbar from '@/components/Navbar'; 

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="bg-gray-100 font-sans h-full flex flex-col">
        {/* 导航栏 */}
        <Navbar />

        {/* 页面内容 */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}