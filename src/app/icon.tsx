import { renderIconMark } from "@/lib/icon-mark";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return renderIconMark({ size: size.width, radius: 14 / 64, inset: 0 });
}
