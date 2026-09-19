export const PHASES = ["raw", "scan", "parse", "output", "hold"] as const;
export type Phase = (typeof PHASES)[number];

/** Milliseconds each phase lasts. One full cycle is about nine seconds. */
export const PHASE_MS: Record<Phase, number> = { raw: 1000, scan: 1300, parse: 1000, output: 2700, hold: 2200 };

export function nextPhase(phase: Phase): Phase {
  return PHASES[(PHASES.indexOf(phase) + 1) % PHASES.length];
}

export function phaseAtLeast(current: Phase, target: Phase): boolean {
  return PHASES.indexOf(current) >= PHASES.indexOf(target);
}

export function phaseFromCursor(cursor: number): Phase {
  const n = PHASES.length;
  return PHASES[((cursor % n) + n) % n];
}

/** Cursor whose phase is "hold": the finished frame that the server renders. */
export const INITIAL_CURSOR = PHASES.length - 1;

/** Illustrative sample data. The pipeline is labeled "Sample run" in the UI and makes no real-world claim. */
export const RAW_LINES: { text: string; hot?: boolean }[] = [
  { text: '<div class="x9f2 _k3" data-v="8a1f">' },
  { text: '  <span class="p__7d">₹ 2,45,00,000</span>', hot: true },
  { text: '  <a href="/p?id=4821&s=e3b0c4">3 BHK · Bandra West</a>', hot: true },
  { text: '  <script>window.__ch="9f3a…"</script>' },
  { text: "  <!-- captcha · session · fingerprint -->" },
  { text: "</div>" },
];

export const CHECKS = ["Session rotated", "Proxy #14", "CAPTCHA solved"] as const;

export const RECORDS = [
  { title: "3 BHK · Bandra West", price_inr: 24500000, area_sqft: 1180 },
  { title: "2 BHK · Powai", price_inr: 13800000, area_sqft: 860 },
  { title: "4 BHK · Worli", price_inr: 61000000, area_sqft: 2150 },
] as const;

export const SAMPLE_TOTAL = 12480;
