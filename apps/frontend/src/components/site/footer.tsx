export default function Footer() {
  return (
    <footer className="border-t border-border/60 mt-16">
      <div className="container py-6 text-sm opacity-80">
        © {new Date().getFullYear()} Night Market · Built with Next.js
      </div>
    </footer>
  );
}
