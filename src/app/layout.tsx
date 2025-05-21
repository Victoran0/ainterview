import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { ClerkProvider } from '@clerk/nextjs';
import { TRPCReactProvider } from "@/trpc/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AInterview",
  description: "AI-Powered Interview Preparation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <TRPCReactProvider>
            <Nav />
            {children}
            <Footer />
            <Toaster position="bottom-right" expand={false} richColors />
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
