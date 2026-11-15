"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-start px-5 py-24 sm:px-8">
      <p className="label">Something went wrong</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
        That page hit a dead end.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        The error has been logged. You can retry, or head back to the city index.
        Your shortlist is still saved in this browser.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <button type="button" onClick={reset} className={buttonVariants()}>
          <RotateCcw className="h-4 w-4" /> Try again
        </button>
        <Link href="/cities" className={buttonVariants({ variant: "outline" })}>
          Browse cities
        </Link>
      </div>
    </div>
  );
}
