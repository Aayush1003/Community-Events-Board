import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { NavBar } from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Community Events Board",
  description: "A local events board for visitors and admins.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full font-sans">
        <NavBar />
        <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>
      </body>
    </html>
  );
}
