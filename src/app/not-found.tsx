import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-xs tracking-[0.3em] text-primary uppercase">404</p>
      <h1 className="mt-3 font-heading text-5xl">That plate isn’t on the menu</h1>
      <p className="mt-4 text-muted-foreground">
        The page you’re looking for has moved or never existed. Head back to the table.
      </p>
      <Link href="/" className={cn(buttonVariants({ size: "lg" }), "mt-8 h-12 px-6")}>
        Back to Raya
      </Link>
    </div>
  );
}
