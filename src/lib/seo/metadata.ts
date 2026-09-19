import type { Metadata } from "next";
import { site } from "@/content/site";

type Input = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  /** Use the title as-is instead of applying the `%s | Ahraf Khatri` template. */
  absoluteTitle?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
};

export function buildMetadata(i: Input): Metadata {
  const shareTitle = i.absoluteTitle ? i.title : `${i.title} | ${site.name}`;
  const common = {
    url: i.path,
    title: shareTitle,
    description: i.description,
    siteName: site.name,
    locale: "en_US",
  };
  const openGraph: NonNullable<Metadata["openGraph"]> =
    i.type === "article"
      ? { type: "article", ...common, publishedTime: i.publishedTime, modifiedTime: i.modifiedTime, authors: [site.name] }
      : { type: "website", ...common };

  return {
    title: i.absoluteTitle ? { absolute: i.title } : i.title,
    description: i.description,
    alternates: { canonical: i.path },
    openGraph,
    twitter: { card: "summary_large_image", title: shareTitle, description: i.description },
  };
}
