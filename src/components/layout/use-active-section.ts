"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function pickActiveSection(intersecting: ReadonlySet<string>, order: readonly string[]): string | null {
  let active: string | null = null;
  for (const id of order) {
    if (intersecting.has(id)) active = id;
  }
  return active;
}

/**
 * Tracks which section crosses a thin band near the top of the viewport.
 * The nav lives in the root layout and survives client-side navigation, so the effect re-runs
 * on every pathname change to re-query the (new) section elements and drop a stale highlight.
 */
export function useActiveSection(ids: readonly string[]): string | null {
  const pathname = usePathname();
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const intersecting = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) intersecting.add(entry.target.id);
          else intersecting.delete(entry.target.id);
        }
        setActive(pickActiveSection(intersecting, ids));
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => {
      observer.disconnect();
      setActive(null);
    };
  }, [ids, pathname]);

  return active;
}
