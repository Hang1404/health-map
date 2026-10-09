import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "BodyMap Health", description: "Personal health record visualization" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
