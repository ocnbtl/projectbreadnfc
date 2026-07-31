import type { MetadataRoute } from "next";
import {
  articles,
  curatedSolutions,
  industries,
  locations,
  siteUrl,
} from "@/lib/site-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/products",
    "/dashboard",
    "/industries",
    "/locations",
    "/resources",
    "/about",
    "/pilot",
    "/privacy",
    "/terms",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: new Date("2026-07-31"),
      changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
      priority: route === "" ? 1 : 0.7,
    })),
    ...industries.map((industry) => ({
      url: `${siteUrl}/industries/${industry.slug}`,
      lastModified: new Date("2026-07-31"),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...locations.map((location) => ({
      url: `${siteUrl}/locations/${location.slug}`,
      lastModified: new Date("2026-07-31"),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...articles.map((article) => ({
      url: `${siteUrl}/resources/${article.slug}`,
      lastModified: new Date("2026-07-31"),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
    ...curatedSolutions.map((solution) => ({
      url: `${siteUrl}/solutions/${solution.location}/${solution.industry}`,
      lastModified: new Date("2026-07-31"),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
  ];
}
