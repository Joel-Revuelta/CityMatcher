import Link from "next/link";
import { Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-start px-5 py-24 sm:px-8">
      <span className="flex h-12 w-12 items-center justify-center border border-border text-primary">
        <Compass className="h-5 w-5" />
      </span>
      <p className="label mt-6">404</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
        This city is not on the map.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        The page you were looking for does not exist. The matching engine is still
        where you left it.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/" className={buttonVariants()}>
          Back home
        </Link>
        <Link href="/cities" className={buttonVariants({ variant: "outline" })}>
          Browse cities
        </Link>
      </div>
    </div>
  );
}
