import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/ui/section";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CountUp } from "@/components/ui/count-up";

export default function HomePage() {
  return (
    <Section id="smoke">
      <Container>
        <SectionHeading id="smoke" eyebrow="Design system" title="Smoke test" intro="Tokens, buttons, cards and reveals render in both themes." />
        <div className="flex flex-wrap items-center gap-3">
          <Button href="/#smoke" arrow>Primary</Button>
          <Button href="/#smoke" variant="secondary">Secondary</Button>
          <ThemeToggle />
          <CountUp value={100} suffix="M+" className="font-mono text-3xl" />
        </div>
        <div className="mt-8 max-w-sm">
          <SpotlightCard className="p-6">
            <p className="text-muted">Hover me: spring lift and cursor light.</p>
          </SpotlightCard>
        </div>
      </Container>
    </Section>
  );
}
