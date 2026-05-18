import type { Metadata } from "next";
import { Inter, Rajdhani } from "next/font/google";

import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { TopNav } from "@/components/layout/TopNav";
import { brand } from "@/lib/config/brand";

import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: brand.appName,
    template: `%s · ${brand.appName}`,
  },
  description: brand.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${rajdhani.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-[#05070A] font-sans text-[#F8FAFC] antialiased">
        <LocaleProvider>
          <TopNav />
          <main className="flex flex-1 flex-col">{children}</main>
        </LocaleProvider>
      </body>
    </html>
  );
}
