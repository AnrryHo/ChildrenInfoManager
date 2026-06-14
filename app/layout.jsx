import "./globals.css";

export const metadata = {
  title: "小芽 · 孩子信息管理",
  description: "轻松整理每个孩子的成长档案",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
