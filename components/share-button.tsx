"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

export function ShareButton({
  label = "Share",
  variant = "outline",
  className,
}: {
  label?: string;
  variant?: "outline" | "primary" | "ghost";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // The user may have cancelled the share sheet.
    }
  }

  return (
    <>
      <Button variant={variant} size="sm" onClick={share} className={className}>
        {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
        {copied ? "Link copied" : label}
      </Button>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </>
  );
}
