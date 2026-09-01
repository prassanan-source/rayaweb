import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { toastOrderUrl } from "@/lib/restaurant";
import { cn } from "@/lib/utils";

type OrderButtonProps = {
  mode?: "pickup" | "delivery";
  size?: "default" | "lg" | "sm";
  variant?: "default" | "outline" | "secondary" | "ghost";
  className?: string;
  children?: React.ReactNode;
};

export function OrderButton({
  mode,
  size = "lg",
  variant = "default",
  className,
  children,
}: OrderButtonProps) {
  return (
    <a
      href={toastOrderUrl(mode)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        buttonVariants({ variant, size }),
        size === "lg" && "h-12 px-6 text-base",
        className
      )}
    >
      {children ?? (mode === "delivery" ? "Order delivery" : mode === "pickup" ? "Order pickup" : "Order online")}
    </a>
  );
}

export function MenuLink({ className }: { className?: string }) {
  return (
    <Link
      href="/menu"
      className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 px-6 text-base", className)}
    >
      View menu
    </Link>
  );
}
