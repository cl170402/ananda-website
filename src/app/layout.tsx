import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ecosystem",
  description: "Health & TechBio deal flow",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
