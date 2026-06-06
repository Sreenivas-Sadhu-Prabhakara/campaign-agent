import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get the free guide",
  description: "Sign up to get the free guide and a few quick wins.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
