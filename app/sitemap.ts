import type { MetadataRoute } from "next";
import { getCitySlugs, DATASET_GENERATED_AT } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/methodology",
    "/sources",
    "/about",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const cityPages = getCitySlugs().map((slug) => ({
    url: `${SITE_URL}/city/${slug}`,
    lastModified: new Date(DATASET_GENERATED_AT),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...cityPages];
}
