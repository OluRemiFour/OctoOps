import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OctoOps - Intelligent Project Management",
  description: "OctoOps - A modern full-stack intelligent project management platform powered by AI",
};

import { AuthProvider } from "@/lib/auth-context";
import ModalProvider from "@/components/modals/ModalProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ModalProvider />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
