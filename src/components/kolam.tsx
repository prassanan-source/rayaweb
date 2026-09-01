import { cn } from "@/lib/utils";

export function Kolam({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      className={cn("text-primary", className)}
    >
      <circle cx="60" cy="60" r="6" fill="currentColor" opacity="0.9" />
      <circle cx="60" cy="60" r="18" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
      <circle cx="60" cy="60" r="32" stroke="currentColor" strokeWidth="0.8" opacity="0.45" />
      <circle cx="60" cy="60" r="46" stroke="currentColor" strokeWidth="0.6" opacity="0.28" />
      {[0, 45, 90, 135].map((deg) => (
        <line
          key={deg}
          x1="60"
          y1="14"
          x2="60"
          y2="106"
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.35"
          transform={`rotate(${deg} 60 60)`}
        />
      ))}
      {[0, 90, 180, 270].map((deg) => (
        <circle
          key={deg}
          cx="60"
          cy="28"
          r="4"
          stroke="currentColor"
          strokeWidth="0.9"
          opacity="0.7"
          transform={`rotate(${deg} 60 60)`}
        />
      ))}
    </svg>
  );
}
