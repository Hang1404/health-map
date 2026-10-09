import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "BodyMap 健康", description: "个人健康记录可视化" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="zh-CN"><body>{children}</body></html>; }
