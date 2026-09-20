import type { CSSProperties } from "react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { sectionCopy } from "@/content/sections";
import { stackFootnote, stackGroups, type StackItem } from "@/content/stack";

function TechChip({ item }: { item: StackItem }) {
  const style = item.icon ? ({ "--brand": `#${item.icon.hex}` } as CSSProperties) : undefined;
  return (
    <li style={style} className="tech-chip flex min-h-11 items-center gap-2.5 rounded-xl border border-line bg-bg px-3 py-2 text-sm">
      <span className="tech-icon grid size-8 place-items-center rounded-lg bg-surface-2 text-muted">
        {item.icon ? (
          <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden>
            <path d={item.icon.path} />
          </svg>
        ) : (
          <span aria-hidden className="font-mono text-[10px] font-bold">
            {item.monogram}
          </span>
        )}
      </span>
      {item.name}
    </li>
  );
}

export function TechStack() {
  const copy = sectionCopy.techStack;
  return (
    <Section id="tech-stack">
      <Container>
        <SectionHeading id="tech-stack" eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} />
        <div className="grid gap-4 md:grid-cols-2">
          {stackGroups.map((group, i) => (
            <Reveal key={group.id} delay={(i % 2) * 0.08} className="h-full">
              <div className="h-full rounded-2xl border border-line bg-surface p-6">
                <h3 className="text-base font-semibold">{group.label}</h3>
                <p className="mt-1 text-sm text-muted">{group.blurb}</p>
                <ul role="list" className="mt-5 flex flex-wrap gap-2.5">
                  {group.items.map((item) => (
                    <TechChip key={item.name} item={item} />
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-muted">{stackFootnote}</p>
      </Container>
    </Section>
  );
}
