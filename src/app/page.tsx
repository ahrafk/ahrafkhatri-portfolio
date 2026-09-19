import { Hero } from "@/components/hero/hero";
import { About } from "@/components/sections/about";
import { CapabilitiesMarquee } from "@/components/sections/capabilities-marquee";
import { Services } from "@/components/sections/services";
import { Stats } from "@/components/sections/stats";
import { Testimonials } from "@/components/sections/testimonials";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CapabilitiesMarquee />
      <Services />
      <Stats />
      <About />
      <Testimonials />
    </>
  );
}
