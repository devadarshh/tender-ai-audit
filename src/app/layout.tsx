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
        <Toaster 
          position="top-center" 
          toastOptions={{
            unstyled: true,
            classNames: {
              toast: 'w-full flex flex-col items-start p-5 bg-brand-dark border border-brand-dark/5 border-l-4 border-brand-accent text-brand-paper rounded-sm shadow-2xl font-inter relative z-[100]',
              title: 'text-[12px] font-black uppercase tracking-widest font-tektur flex items-center gap-2',
              description: 'text-[11px] font-medium opacity-80 mt-1.5 leading-relaxed',
              success: 'border-l-emerald-500',
              error: 'border-l-rose-500',
              info: 'border-l-brand-secondary',
            }
          }}
        />
      </body>
    </html>
  );
}
