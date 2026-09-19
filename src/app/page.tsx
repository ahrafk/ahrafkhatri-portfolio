import { Hero } from "@/components/hero/hero";
import { About } from "@/components/sections/about";
import { CapabilitiesMarquee } from "@/components/sections/capabilities-marquee";
import { CaseStudies } from "@/components/sections/case-studies";
import { Services } from "@/components/sections/services";
import { Stats } from "@/components/sections/stats";
import { TechStack } from "@/components/sections/tech-stack";
import { Testimonials } from "@/components/sections/testimonials";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CapabilitiesMarquee />
      <Services />
      <Stats />
      <About />
      <CaseStudies />
      <TechStack />
      <Testimonials />
    </>
  );
}
