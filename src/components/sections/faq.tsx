import { ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { faq } from "@/content/faq";
import { sectionCopy } from "@/content/sections";

/** Native <details>: keyboard accessible, works without JS, and every answer stays in the HTML for crawlers and AI engines. */
export function Faq() {
  const copy = sectionCopy.faq;
  return (
    <Section id="faq">
      <Container className="max-w-[860px]">
        <SectionHeading id="faq" eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} className="lg:grid-cols-1" />
        <div className="space-y-3">
          {faq.map((item, i) => (
            <Reveal key={item.question} delay={Math.min(i, 4) * 0.04}>
              <details open={i === 0} className="group rounded-2xl border border-line bg-surface open:bg-surface-2/60">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
                  <h3 className="text-base font-semibold">{item.question}</h3>
                  <ChevronDown className="size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180" aria-hidden />
                </summary>
                <p className="text-pretty px-5 pb-5 text-muted">{item.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
