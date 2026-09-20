import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <Container className="flex min-h-[70dvh] flex-col items-start justify-center py-32">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">404</p>
      <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">This page could not be found.</h1>
      <p className="mt-4 max-w-md text-muted">The link may be old or mistyped. These will get you back on track.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/" arrow>
          Back to home
        </Button>
        <Button href="/#case-studies" variant="secondary">
          View case studies
        </Button>
      </div>
    </Container>
  );
}
