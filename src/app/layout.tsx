import "@/styles/globals.css";

import { type Metadata } from "next";
import { Tektur, Platypi, Inter } from "next/font/google";
import { Toaster } from 'sonner';

import { TRPCReactProvider } from "@/trpc/react";

/**
 * BRICKANTA BRAND FONTS: 
 * Using Google Font optimization for the MVP 'Senior' look.
 */
const tektur = Tektur({
  subsets: ["latin"],
  variable: "--font-tektur",
});

const platypi = Platypi({
  subsets: ["latin"],
  variable: "--font-platypi",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Brickanta | Agentic AI for Society Builders",
  description: "AI platform for construction tender analysis and risk management.",
  icons: [{ rel: "icon", url: "/icon.png" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${tektur.variable} ${platypi.variable} ${inter.variable} antialiased`}>
      <body className="bg-brand-bg text-brand-dark">
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
