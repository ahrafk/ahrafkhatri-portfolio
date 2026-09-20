import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

type Props = {
  href: string;
  variant?: Variant;
  arrow?: boolean;
  className?: string;
  children: ReactNode;
};

const base =
  "group inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition-[transform,translate,scale,background-color,border-color] duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.97]";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-fg shadow-[0_8px_24px_-10px_rgb(var(--glow)/0.7)] hover:brightness-110",
  secondary: "border border-line bg-surface text-fg hover:bg-surface-2",
  ghost: "text-fg hover:bg-surface-2",
};

export function Button({ href, variant = "primary", arrow, className, children }: Props) {
  const classes = cn(base, variants[variant], className);
  const content = (
    <>
      {children}
      {arrow ? <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden /> : null}
    </>
  );

  if (href.startsWith("mailto:") || href.startsWith("http")) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
