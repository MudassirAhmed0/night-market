import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Night Market",
  description: "Discover and book unforgettable nights.",
  metadataBase: new URL("http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <header className="border-b border-white/10">
          <div className="container flex items-center h-14">
            <span className="font-semibold">Night Market</span>
          </div>
        </header>
        <main className="container py-8">{children}</main>
        <footer className="border-t border-white/10">
          <div className="container text-sm py-6 opacity-70">
            © {new Date().getFullYear()} Night Market
          </div>
        </footer>
      </body>
    </html>
  );
}
