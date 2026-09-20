import type { Metadata } from "next";
import { Hero } from "@/components/hero/hero";
import { JsonLd } from "@/components/seo/json-ld";
import { About } from "@/components/sections/about";
import { CapabilitiesMarquee } from "@/components/sections/capabilities-marquee";
import { CaseStudies } from "@/components/sections/case-studies";
import { Contact } from "@/components/sections/contact";
import { Faq } from "@/components/sections/faq";
import { Services } from "@/components/sections/services";
import { Stats } from "@/components/sections/stats";
import { TechStack } from "@/components/sections/tech-stack";
import { Testimonials } from "@/components/sections/testimonials";
import { site } from "@/content/site";
import { buildMetadata } from "@/lib/seo/metadata";
import { homeGraph } from "@/lib/seo/schema";

export const metadata: Metadata = buildMetadata({
  title: site.homeTitle,
  description: site.description,
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={homeGraph()} />
      <Hero />
      <CapabilitiesMarquee />
      <Services />
      <Stats />
      <About />
      <CaseStudies />
      <TechStack />
      <Testimonials />
      <Faq />
      <Contact />
    </>
  );
}
