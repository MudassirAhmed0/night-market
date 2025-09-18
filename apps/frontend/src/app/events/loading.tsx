import Skelton from "@/components/ui/skelton";

 

export default function Loading() {
  // Match the card grid to avoid layout shift
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <Skelton className="h-6 w-40" />
        <Skelton className="h-4 w-64" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border overflow-hidden">
            <Skelton className="aspect-[16/9]" />
            <div className="p-4 space-y-2">
              <Skelton className="h-4 w-3/4" />
              <Skelton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
