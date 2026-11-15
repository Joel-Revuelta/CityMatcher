"use client";

import { CompareButton } from "./compare-button";
import { ShortlistButton } from "./shortlist-button";
import { ShareButton } from "./share-button";

export function CityActions({ slug, name }: { slug: string; name: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ShortlistButton slug={slug} name={name} />
      <CompareButton slug={slug} name={name} />
      <ShareButton label="Share profile" />
    </div>
  );
}
