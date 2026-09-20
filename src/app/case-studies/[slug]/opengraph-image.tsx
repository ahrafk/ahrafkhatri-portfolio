import { notFound } from "next/navigation";
import { caseStudies, getCaseStudy } from "@/content/case-studies";
import { renderOg } from "@/lib/og";

export const alt = "Case study by Ahraf Khatri";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The page's own `dynamicParams = false` does not cover this route, so repeat it: unknown slugs must 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  if (!cs) notFound();
  return renderOg({ eyebrow: cs.category, title: cs.title, subtitle: cs.summary });
}
