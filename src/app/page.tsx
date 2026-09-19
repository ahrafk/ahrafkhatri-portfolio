import { Hero } from "@/components/hero/hero";
import { CapabilitiesMarquee } from "@/components/sections/capabilities-marquee";
import { Services } from "@/components/sections/services";
import { Stats } from "@/components/sections/stats";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CapabilitiesMarquee />
      <Services />
      <Stats />
    </>
  );
}
