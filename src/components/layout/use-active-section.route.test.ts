// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const nav = vi.hoisted(() => ({ pathname: "/case-studies/real-estate-scraping" }));
vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname }));

import { useActiveSection } from "./use-active-section";

const ids = ["about", "services"] as const;

type Callback = (entries: { isIntersecting: boolean; target: { id: string } }[]) => void;
let callbacks: Callback[] = [];
const observe = vi.fn();
const disconnect = vi.fn();

class FakeIntersectionObserver {
  constructor(callback: Callback) {
    callbacks.push(callback);
  }
  observe = observe;
  disconnect = disconnect;
  unobserve = vi.fn();
}

function addSection(id: string) {
  const el = document.createElement("section");
  el.id = id;
  document.body.appendChild(el);
  return el;
}

describe("useActiveSection across client-side navigation", () => {
  beforeEach(() => {
    nav.pathname = "/case-studies/real-estate-scraping";
    callbacks = [];
    observe.mockClear();
    disconnect.mockClear();
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    vi.unstubAllGlobals();
  });

  it("observes nothing when no section is in the DOM", () => {
    renderHook(() => useActiveSection(ids));
    expect(observe).not.toHaveBeenCalled();
  });

  it("re-attaches the observer to sections that mount after a pathname change", () => {
    const { rerender } = renderHook(() => useActiveSection(ids));
    expect(observe).not.toHaveBeenCalled();

    const about = addSection("about");
    const services = addSection("services");
    nav.pathname = "/";
    rerender();

    expect(observe).toHaveBeenCalledWith(about);
    expect(observe).toHaveBeenCalledWith(services);
  });

  it("clears the active section when navigating to a page without sections", () => {
    nav.pathname = "/";
    addSection("about");
    const { result, rerender } = renderHook(() => useActiveSection(ids));

    act(() => callbacks[0]?.([{ isIntersecting: true, target: { id: "about" } }]));
    expect(result.current).toBe("about");

    document.body.innerHTML = "";
    nav.pathname = "/case-studies/real-estate-scraping";
    rerender();

    expect(result.current).toBeNull();
  });
});
