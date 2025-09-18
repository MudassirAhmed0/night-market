import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-border/60 sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-bg/70">
      <div className="container h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">
          Night Market
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/events" className="opacity-90 hover:opacity-100">
            Events
          </Link>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className="opacity-90 hover:opacity-100"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
