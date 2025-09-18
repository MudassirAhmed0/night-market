import { cn } from "@/lib/utils";

export function Badge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-card px-3 py-1 text-xs font-medium border border-border",
        className
      )}
    >
      {children}
    </span>
  );
}
