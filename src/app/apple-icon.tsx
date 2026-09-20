import { renderIconMark } from "@/lib/icon-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS rounds the corners itself, so this is a full-bleed square with the mark inset.
export default function AppleIcon() {
  return renderIconMark({ size: size.width, radius: 0, inset: 0.1 });
}
