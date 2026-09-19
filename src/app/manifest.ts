import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "Ahraf Khatri",
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0a1020",
    theme_color: "#0a1020",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
