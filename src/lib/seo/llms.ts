import { about } from "@/content/about";
import { caseStudies } from "@/content/case-studies";
import { faq } from "@/content/faq";
import { services } from "@/content/services";
import { absoluteUrl, site } from "@/content/site";
import { stackGroups } from "@/content/stack";

const contactLines = () => [
  `- Email: ${site.email}`,
  `- LinkedIn: ${site.social.linkedin}`,
  `- GitHub: ${site.social.github}`,
  `- Location: ${site.location.locality}, ${site.location.country}`,
];

/** Summary index following the llms.txt convention. */
export function buildLlmsTxt(): string {
  return [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `${site.name} is a ${site.jobTitle.toLowerCase()} based in ${site.location.locality}, ${site.location.country}, working with clients globally.`,
    "",
    "## Services",
    ...services.map((s) => `- [${s.title}](${absoluteUrl("/#services")}): ${s.description}`),
    "",
    "## Case studies",
    ...caseStudies.map((c) => `- [${c.title}](${absoluteUrl(`/case-studies/${c.slug}`)}): ${c.summary}`),
    "",
    "## Optional",
    `- [Full content as Markdown](${absoluteUrl("/llms-full.txt")}): every page in one file`,
    "",
    "## Contact",
    ...contactLines(),
    "",
  ].join("\n");
}

/** The whole site's substance as one Markdown document. */
export function buildLlmsFullTxt(): string {
  const parts: string[] = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    "## About",
    ...about.paragraphs.flatMap((p) => [p, ""]),
    "## Services",
    ...services.flatMap((s) => [`### ${s.title}`, s.description, ""]),
  ];

  parts.push("## Case studies", "");
  for (const c of caseStudies) {
    parts.push(
      `### ${c.title}`,
      `URL: ${absoluteUrl(`/case-studies/${c.slug}`)}`,
      `Category: ${c.category}`,
      "",
      c.summary,
      "",
      "**Problem**",
      c.problem,
      "",
      "**Approach**",
      ...c.approach.map((a, i) => `${i + 1}. ${a.title}: ${a.body}`),
      "",
      "**Outcomes**",
      ...c.outcomes.map((o) => `- ${o}`),
      "",
    );
    if (c.stack) parts.push(`**Tools named**: ${c.stack.join(", ")}`, "");
  }

  parts.push("## Tech stack", "");
  for (const g of stackGroups) parts.push(`- ${g.label}: ${g.items.map((i) => i.name).join(", ")}`);

  parts.push("", "## Frequently asked questions", "");
  for (const f of faq) parts.push(`### ${f.question}`, f.answer, "");

  parts.push("## Contact", ...contactLines(), "");
  return parts.join("\n");
}
