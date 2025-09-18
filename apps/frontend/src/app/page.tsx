import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to Night Market
        </h1>
        <p className="text-muted">
          A mini marketplace demo. Frontend: Next.js + Tailwind. Backend:
          NestJS.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Start exploring</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Badge>SEO/SSR-ready</Badge>
          <Link href="/events">
            <Button className="cursor-pointer">Browse Events</Button>
          </Link>
          <a href="http://localhost:4000/docs" target="_blank" rel="noreferrer">
            <Button variant="outline" className="cursor-pointer">
              API Docs
            </Button>
          </a>
        </CardContent>
      </Card>
    </section>
  );
}
