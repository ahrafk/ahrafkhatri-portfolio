import { describe, expect, it } from "vitest";
import { buildMetadata } from "./metadata";

describe("buildMetadata", () => {
  it("sets canonical, Open Graph and Twitter fields", () => {
    const m = buildMetadata({ title: "Case A", description: "Desc", path: "/case-studies/a" });
    expect(m.alternates?.canonical).toBe("/case-studies/a");
    expect(m.openGraph).toMatchObject({ type: "website", url: "/case-studies/a", siteName: "Ahraf Khatri", locale: "en_US" });
    expect(m.twitter).toMatchObject({ card: "summary_large_image" });
  });

  it("uses an absolute title when asked, without the site template", () => {
    const m = buildMetadata({ title: "Home Title", description: "D", path: "/", absoluteTitle: true });
    expect(m.title).toEqual({ absolute: "Home Title" });
    expect(m.openGraph?.title).toBe("Home Title");
  });

  it("appends the site name to Open Graph titles otherwise", () => {
    const m = buildMetadata({ title: "Case A", description: "D", path: "/x" });
    expect(m.openGraph?.title).toBe("Case A | Ahraf Khatri");
  });

  it("emits article times for articles", () => {
    const m = buildMetadata({ title: "T", description: "D", path: "/x", type: "article", publishedTime: "2026-09-19", modifiedTime: "2026-09-19" });
    expect(m.openGraph).toMatchObject({ type: "article", publishedTime: "2026-09-19", modifiedTime: "2026-09-19", authors: ["Ahraf Khatri"] });
  });
});
