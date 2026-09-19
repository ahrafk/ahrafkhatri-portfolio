import { BadgeCheck, CircleCheck, Clock, Globe, Layers, MapPin } from "lucide-react";
import { ExtractionPipeline } from "@/components/pipeline/extraction-pipeline";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { hero } from "@/content/hero";
import { HeroHeadline } from "./hero-headline";

const factIcons = { pin: MapPin, clock: Clock, globe: Globe, layers: Layers, badge: BadgeCheck } as const;

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden pb-16 pt-28 sm:pb-24 sm:pt-36">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0 opacity-60" />
        <div className="absolute left-1/2 top-[-12%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(var(--glow)/0.2),transparent)] blur-2xl" />
      </div>

      <Container className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Reveal y={10}>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">{hero.eyebrow}</p>
          </Reveal>
          <HeroHeadline lines={hero.headline} />
          <Reveal delay={0.35}>
            <p className="mt-6 max-w-xl text-pretty text-lg text-muted">{hero.intro}</p>
            <ul className="mt-8 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {hero.ticks.map((tick) => (
                <li key={tick} className="flex items-center gap-2.5 text-sm">
                  <CircleCheck className="size-[18px] shrink-0 text-accent" aria-hidden />
                  {tick}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button href={hero.primaryCta.href} arrow>
                {hero.primaryCta.label}
              </Button>
              <Button href={hero.secondaryCta.href} variant="secondary">
                {hero.secondaryCta.label}
              </Button>
            </div>
          </Reveal>
        </div>

        <ExtractionPipeline />
      </Container>

      <Container className="mt-14">
        <Reveal delay={0.1}>
          <ul className="flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-6 text-sm text-muted">
            {hero.facts.map((fact) => {
              const Icon = factIcons[fact.icon];
              return (
                <li key={fact.label} className="flex items-center gap-2">
                  <Icon className="size-4 text-accent" aria-hidden />
                  {fact.label}
                </li>
              );
            })}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
