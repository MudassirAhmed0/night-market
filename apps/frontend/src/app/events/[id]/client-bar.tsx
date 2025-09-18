"use client";

import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/lib/env";
import { Button } from "@/components/ui/button";

// Tiny example of using hydrated cache on client
export default function ClientBar({ id }: { id: string }) {
  const { data } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/events/${id}`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ title: string }>;
    },
  });

  return (
    <div className="flex gap-2 pt-2">
      <Button variant="outline" aria-label="Share event">
        Share
      </Button>
      <Button>Add to Favorites</Button>
      <span className="text-sm opacity-70 ml-auto">
        Loaded: {data?.title ? "cached" : "live"}
      </span>
    </div>
  );
}
