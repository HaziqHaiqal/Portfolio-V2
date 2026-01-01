import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css";
import { ThemeProvider } from "@components/providers/ThemeProvider";
import { MaintenanceProvider } from "@components/providers/MaintenanceProvider";
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@components/ui/sonner"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk"
});

export const metadata: Metadata = {
  title: "Portfolio @ Haziq Haiqal",
  description: "Software Developer specializing in React, TypeScript, and SAP ABAP. Building innovative web solutions and exceptional user experiences.",
  keywords: [
    "Haziq Haiqal",
    "Software Developer",
    "React Developer",
    "TypeScript",
    "SAP ABAP",
    "Full Stack Developer",
    "Portfolio",
    "Web Development"
  ],
  authors: [{ name: "Muhammad Haziq Haiqal Kamaruddin" }],
  creator: "Haziq Haiqal",
  publisher: "Haziq Haiqal",
  robots: "index, follow",
  openGraph: {
    title: "Portfolio @ Haziq Haiqal",
    description: "Software Developer specializing in React, TypeScript, and SAP ABAP. Building innovative web solutions.",
    url: "https://haziqhaiqal.com",
    siteName: "Haziq Haiqal Portfolio",
    locale: "en_MY",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Portfolio @ Haziq Haiqal",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-inter antialiased bg-gray-50 text-gray-900`} suppressHydrationWarning>
        <ThemeProvider>
          <MaintenanceProvider>
            {children}
          </MaintenanceProvider>
          <Toaster />
          <SpeedInsights />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
