import { ExternalLink } from "lucide-react";
import type { SourceRef } from "@/lib/types";
import { formatDate } from "@/lib/format";

export function SourceList({ sources }: { sources: SourceRef[] }) {
  return (
    <ul className="space-y-3">
      {sources.map((source) => (
        <li key={`${source.label}-${source.asOf}`} className="text-sm">
          <a
            href={source.url}
            target={source.url.startsWith("http") ? "_blank" : undefined}
            rel={source.url.startsWith("http") ? "noreferrer" : undefined}
            className="inline-flex items-center gap-1.5 font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            {source.label}
            {source.url.startsWith("http") ? <ExternalLink className="h-3 w-3" /> : null}
          </a>
          <p className="mt-0.5 text-xs text-muted-foreground">
            As of {formatDate(source.asOf)}
            {source.note ? ` · ${source.note}` : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}
