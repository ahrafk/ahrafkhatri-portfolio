import { hero } from "@/content/hero";
import { site } from "@/content/site";
import { renderOg } from "@/lib/og";

export const alt = site.homeTitle;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOg({
    // Same words as the hero; the card just uses a middle dot where the hero uses a pipe.
    eyebrow: hero.eyebrow.replaceAll(" | ", " · "),
    title: hero.headline.flat().map((segment) => segment.text).join(" "),
    subtitle: site.description,
  });
}
