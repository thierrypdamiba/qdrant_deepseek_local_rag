import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
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
  title: "Qdrant RBAC Demo",
  description: "Interactive demonstration of Role-Based Access Control (RBAC) using Qdrant vector database with semantic search capabilities",
  keywords: [
    "Qdrant",
    "RBAC",
    "Vector Database",
    "Semantic Search",
    "Access Control",
    "Next.js",
    "Demo"
  ],
  authors: [
    {
      name: "North Star Support",
    }
  ],
  creator: "North Star Support",
  publisher: "North Star Support",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Qdrant RBAC Demo",
    description: "Explore role-based access control in action with semantic search capabilities",
    type: "website",
    siteName: "Qdrant RBAC Demo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Qdrant RBAC Demo",
    description: "Explore role-based access control in action with semantic search capabilities",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  icons: {
    icon: '/favicon.ico?v=1',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
