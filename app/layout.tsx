import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css";
import { ThemeProvider } from "@components/providers/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk"
});

export const metadata: Metadata = {
  title: "Muhammad Haziq Haiqal Kamaruddin - Developer, Gamer & Pianist",
  description: "Software Developer at Maybank Berhad with expertise in React, JavaScript, Python, and SAP ABAP. Passionate about creating innovative solutions and exceptional user experiences.",
  keywords: ["Software Developer", "React", "JavaScript", "Python", "SAP ABAP", "Full Stack", "Frontend", "Backend"],
  authors: [{ name: "Muhammad Haziq Haiqal Kamaruddin" }],
  openGraph: {
    title: "Muhammad Haziq Haiqal Kamaruddin - Developer, Gamer & Pianist",
    description: "Software Developer at Maybank Berhad with expertise in React, JavaScript, Python, and SAP ABAP.",
    url: "https://haziqhaiqal.netlify.app",
    siteName: "Haziq Portfolio",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-inter antialiased bg-gray-50 text-gray-900`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
