import Image from "next/image";

export default function Home() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Welcome to Night Market</h1>
      <p className="opacity-80">
        A minimal monorepo starter. Frontend: Next.js + Tailwind. Backend:
        NestJS.
      </p>
      <p>Use the header to navigate. We’ll add Events soon.</p>
    </section>
  );
}
