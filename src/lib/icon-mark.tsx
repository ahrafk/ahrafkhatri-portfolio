import { ImageResponse } from "next/og";

/** Same "AK" mark as `src/app/icon.svg`: strokes, not glyphs, so the PNG icons need no font. */
const NAVY = "#0a1020";
const BLUE = "#4c9aff";

type Input = {
  size: number;
  /** Corner radius as a fraction of the tile's width. Use 0 where the platform applies its own mask (iOS). */
  radius: number;
  /** Fraction of the tile left empty on each side, so the mark survives a platform's rounding. */
  inset: number;
};

/** Renders the mark on a navy tile as a PNG `ImageResponse`. No faces, no people: just the monogram. */
export function renderIconMark({ size, radius, inset }: Input) {
  const scale = 1 - inset * 2;
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "transparent" }}>
        <svg width={size} height={size} viewBox="0 0 64 64">
          <rect width="64" height="64" rx={64 * radius} fill={NAVY} />
          <g
            transform={`translate(${32 - 32 * scale} ${32 - 32 * scale}) scale(${scale})`}
            fill="none"
            stroke={BLUE}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 47 23 17 34 47" />
            <path d="M16.5 37h13" />
            <path d="M42 17v30" />
            <path d="M53 17 42 33" />
            <path d="M45.5 30 54 47" />
          </g>
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}
