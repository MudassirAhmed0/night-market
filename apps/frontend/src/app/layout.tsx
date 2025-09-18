import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/site/header";
import Footer from "@/components/site/footer";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Night Market",
  description: "Discover and book unforgettable nights.",
  metadataBase: new URL("http://localhost:3000"),
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    title: "Night Market",
    description: "Discover and book unforgettable nights.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body>
        {/* Skip link for screen readers & keyboard */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary text-primaryFg px-3 py-2 rounded"
        >
          Skip to content
        </a>

        <Header />
        <main id="main" className="container py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
