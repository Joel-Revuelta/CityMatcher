import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Compass className="h-6 w-6" />
      </span>
      <p className="eyebrow mt-5">404</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
        This city is not on the map.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        The page you were looking for does not exist. The matching engine is still
        where you left it.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/" className={buttonVariants()}>
          <Home className="h-4 w-4" /> Back home
        </Link>
        <Link href="/results" className={buttonVariants({ variant: "outline" })}>
          Explore cities
        </Link>
      </div>
    </div>
  );
}
