import { ThemeProvider } from "@/components/theme-provider";
import { SharedLayout } from "@/components/shared-layout";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stock Analysis",
  description: "Stock analysis application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SharedLayout>
            <main className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </main>
          </SharedLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
