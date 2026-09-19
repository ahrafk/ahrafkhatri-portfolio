import { caseStudies, getCaseStudy } from "@/content/case-studies";
import { renderOg } from "@/lib/og";

export const alt = "Case study by Ahraf Khatri";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  return renderOg({
    eyebrow: cs?.category ?? "Case study",
    title: cs?.title ?? "Case study",
    subtitle: cs?.summary ?? "",
  });
}
