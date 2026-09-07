import type { Metadata, Viewport } from "next";
import { Anek_Tamil } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const anekTamil = Anek_Tamil({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-anek",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Francisco Guardado — Book 1",
  description: "Official site for Book 1 by Francisco Guardado",
};

export const viewport: Viewport = {
  themeColor: "#111111",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={anekTamil.variable}>
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
