import { Braces, Cloud, Database, Globe, ScanText, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { sectionCopy } from "@/content/sections";
import { services } from "@/content/services";

const icons = { globe: Globe, shield: ShieldCheck, scan: ScanText, database: Database, cloud: Cloud, braces: Braces } as const;

export function Services() {
  const copy = sectionCopy.services;
  return (
    <Section id="services">
      <Container>
        <SectionHeading id="services" eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} />
        <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => {
            const Icon = icons[service.icon];
            return (
              <li key={service.id}>
                <Reveal delay={(i % 3) * 0.07} className="h-full">
                  <SpotlightCard className="p-6">
                    <span className="grid size-11 place-items-center rounded-xl bg-surface-2 text-accent">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold tracking-[-0.01em]">{service.title}</h3>
                    <p className="mt-2 text-sm text-muted">{service.description}</p>
                  </SpotlightCard>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
