import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { I18nProvider } from "../lib/i18n";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter" 
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-playfair"
});

export const metadata: Metadata = {
  title: "RightPath — AI RTI Ingestion & Resolution Copilot",
  description: "Helping citizens file Right to Information applications with legal authority and zero complexity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-parchment text-ink min-h-screen`}>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
