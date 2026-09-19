import { ArrowRight, ChevronRight, CircleCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArchitectureDiagram } from "@/components/case-study/architecture-diagram";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { caseStudies, getCaseStudy } from "@/content/case-studies";
import { caseStudyPageCopy as copy } from "@/content/case-study-page";
import { buildMetadata } from "@/lib/seo/metadata";
import { caseStudyGraph } from "@/lib/seo/schema";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  if (!cs) return {};
  return buildMetadata({
    title: cs.title,
    description: cs.metaDescription,
    path: `/case-studies/${cs.slug}`,
    type: "article",
    publishedTime: cs.datePublished,
    modifiedTime: cs.dateModified,
  });
}

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

const h2 = "text-2xl font-semibold tracking-[-0.02em] sm:text-3xl";

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  if (!cs) notFound();
  const others = caseStudies.filter((c) => c.slug !== cs.slug);

  return (
    <>
      <JsonLd data={caseStudyGraph(cs)} />
      <article className="pb-20 pt-28 sm:pt-36">
        <Container className="max-w-[860px]">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
              <li>
                <Link href="/" className="hover:text-fg">Home</Link>
              </li>
              <ChevronRight className="size-3.5" aria-hidden />
              <li>
                <Link href="/#case-studies" className="hover:text-fg">Case studies</Link>
              </li>
              <ChevronRight className="size-3.5" aria-hidden />
              <li aria-current="page" className="text-fg">{cs.title}</li>
            </ol>
          </nav>

          <header className="mt-8">
            <p className="w-fit rounded-md bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-accent">{cs.category}</p>
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">{cs.title}</h1>
            <p className="mt-5 text-pretty text-lg text-muted">{cs.summary}</p>
            <p className="mt-4 text-sm text-muted">
              {copy.published} <time dateTime={cs.datePublished}>{formatDate(cs.datePublished)}</time>
            </p>
          </header>

          <Reveal className="mt-14">
            <section aria-labelledby="problem-title">
              <h2 id="problem-title" className={h2}>{copy.problem}</h2>
              <p className="mt-4 text-pretty text-muted">{cs.problem}</p>
            </section>
          </Reveal>

          <Reveal className="mt-14">
            <section aria-labelledby="approach-title">
              <h2 id="approach-title" className={h2}>{copy.approach}</h2>
              <ol className="mt-6 space-y-4">
                {cs.approach.map((step, i) => (
                  <li key={step.title} className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
                    <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 font-mono text-sm font-semibold text-accent">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold">{step.title}</h3>
                      <p className="mt-1 text-sm text-muted">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </Reveal>

          <section aria-labelledby="architecture-title" className="mt-14">
            <h2 id="architecture-title" className={h2}>{copy.architecture}</h2>
            <div className="mt-6">
              <ArchitectureDiagram stages={cs.architecture} />
            </div>
            <p className="mt-4 text-sm text-muted">{copy.architectureNote}</p>
          </section>

          {cs.stack ? (
            <Reveal className="mt-14">
              <section aria-labelledby="stack-title">
                <h2 id="stack-title" className={h2}>{copy.stack}</h2>
                <ul className="mt-6 flex flex-wrap gap-2.5">
                  {cs.stack.map((tool) => (
                    <li key={tool} className="rounded-xl border border-line bg-surface px-4 py-2 font-mono text-sm">{tool}</li>
                  ))}
                </ul>
              </section>
            </Reveal>
          ) : null}

          <Reveal className="mt-14">
            <section aria-labelledby="outcomes-title">
              <h2 id="outcomes-title" className={h2}>{copy.outcomes}</h2>
              <ul className="mt-6 space-y-3">
                {cs.outcomes.map((outcome) => (
                  <li key={outcome} className="flex items-start gap-3">
                    <CircleCheck className="mt-0.5 size-5 shrink-0 text-ok" aria-hidden />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>

          <Reveal className="mt-16">
            <aside className="rounded-2xl border border-line bg-surface-2 p-8 text-center">
              <h2 className="text-2xl font-semibold tracking-[-0.02em]">{copy.ctaTitle}</h2>
              <p className="mx-auto mt-3 max-w-md text-muted">{copy.ctaBody}</p>
              <Button href="/#contact" arrow className="mt-6">{copy.ctaLabel}</Button>
            </aside>
          </Reveal>

          <nav aria-label={copy.more} className="mt-16">
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{copy.more}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {others.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/case-studies/${c.slug}`}
                    className="group flex min-h-11 items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 transition-colors hover:bg-surface-2"
                  >
                    <span className="font-medium">{c.title}</span>
                    <ArrowRight className="size-4 shrink-0 text-accent transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </article>
    </>
  );
}
