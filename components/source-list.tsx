import { ExternalLink } from "lucide-react";
import type { SourceRef } from "@/lib/types";
import { formatDate } from "@/lib/format";

export function SourceList({ sources }: { sources: SourceRef[] }) {
  return (
    <ol className="space-y-3">
      {sources.map((source, index) => (
        <li
          key={`${source.label}-${source.asOf}`}
          className="grid grid-cols-[1.5rem_1fr] gap-2 border-b border-border/60 pb-3 text-sm last:border-0 last:pb-0"
        >
          <span className="font-mono text-xs text-primary">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <a
              href={source.url}
              target={source.url.startsWith("http") ? "_blank" : undefined}
              rel={source.url.startsWith("http") ? "noreferrer" : undefined}
              className="inline-flex items-center gap-1.5 font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              {source.label}
              {source.url.startsWith("http") ? <ExternalLink className="h-3 w-3" /> : null}
            </a>
            <p className="mt-0.5 text-xs text-muted-foreground">
              As of {formatDate(source.asOf)}
              {source.note ? `, ${source.note}` : ""}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
