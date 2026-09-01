"use client";

import { useEffect, useState } from "react";
import { statusCopy } from "@/lib/hours";
import { cn } from "@/lib/utils";

export function OpenBadge({ className }: { className?: string }) {
  const [status, setStatus] = useState(statusCopy);

  useEffect(() => {
    const id = window.setInterval(() => setStatus(statusCopy()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span
      suppressHydrationWarning
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs tracking-wide uppercase",
        status.open
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-muted/40 text-muted-foreground",
        className
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status.open ? "bg-primary shadow-[0_0_8px_currentColor]" : "bg-muted-foreground"
        )}
      />
      {status.label}
    </span>
  );
}
