"use client";

import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { navLinks } from "@/content/sections";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import { useActiveSection } from "./use-active-section";

const SECTION_IDS = navLinks.map((l) => l.id);

function subscribeToScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

function useScrolled(threshold = 8) {
  return useSyncExternalStore(subscribeToScroll, () => window.scrollY > threshold, () => false);
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled();
  const active = useActiveSection(SECTION_IDS);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-300",
        scrolled || open ? "border-line bg-bg/80 backdrop-blur-xl" : "border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
        {/* No aria-label: the accessible name is the visible text (WCAG 2.5.3, Label in Name), plus a spoken-only "home". */}
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-accent font-mono text-sm font-bold text-accent-fg">
            AK
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold">{site.brand}</span>
            <span className="hidden text-[11px] text-muted sm:block lg:hidden xl:block">Web Intelligence Consultant</span>
            <span className="sr-only">, home</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={`/#${link.id}`}
              aria-current={active === link.id ? "location" : undefined}
              className={cn(
                "whitespace-nowrap rounded-full px-3.5 py-2 text-sm text-muted transition-colors duration-200 hover:text-fg",
                active === link.id && "bg-surface-2 text-fg",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button href="/#contact" arrow className="hidden whitespace-nowrap lg:inline-flex">
            Let&apos;s Work Together
          </Button>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full border border-line bg-surface lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <m.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-t border-line bg-bg/95 backdrop-blur-xl lg:hidden"
          >
            <nav aria-label="Mobile" className="mx-auto flex max-w-[1200px] flex-col gap-1 px-4 py-4 sm:px-6">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  href={`/#${link.id}`}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center rounded-lg px-3 text-base text-fg hover:bg-surface-2"
                >
                  {link.label}
                </Link>
              ))}
              <Button href="/#contact" arrow className="mt-2 w-full">
                Let&apos;s Work Together
              </Button>
            </nav>
          </m.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
