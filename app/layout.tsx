import type { Metadata, Viewport } from "next";
import { Inter, Rajdhani } from "next/font/google";

import { AuthProvider } from "@/components/providers/AuthProvider";
import { PostAuthRedirect } from "@/components/auth/PostAuthRedirect";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { AppShell } from "@/components/layout/AppShell";
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
    default: brand.metadata.title,
    template: `%s · ${brand.metadata.siteName}`,
  },
  description: brand.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
          <AuthProvider>
            <PostAuthRedirect />
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
