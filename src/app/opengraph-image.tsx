import { site } from "@/content/site";
import { renderOg } from "@/lib/og";

export const alt = site.homeTitle;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOg({
    eyebrow: "Data Engineer · Web Intelligence Consultant",
    title: "Turn Difficult Websites Into Reliable Data.",
    subtitle: site.description,
  });
}
