export type Stat = { value: number; suffix: string; label: string };

/** User-supplied figures from the original design; only the owner can vouch for them. */
export const stats: Stat[] = [
  { value: 5, suffix: "+", label: "Years of Experience" },
  { value: 35, suffix: "+", label: "Projects Completed" },
  { value: 100, suffix: "M+", label: "Pages Processed" },
  { value: 99, suffix: "%", label: "Uptime Focus" },
];
