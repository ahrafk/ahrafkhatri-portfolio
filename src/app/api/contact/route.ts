import { Resend } from "resend";
import { z } from "zod";
import { site } from "@/content/site";
import { buildEmailSubject, buildEmailText, contactSchema } from "@/lib/contact";
import { createRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Best effort, per server instance. Put a shared store behind this if the site is scaled out.
const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

const json = (body: unknown, status = 200, headers?: HeadersInit) => Response.json(body, { status, headers });

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = limiter.check(ip);
  if (!limit.ok) return json({ error: "rate_limited" }, 429, { "Retry-After": String(limit.retryAfterSeconds) });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  // Honeypot: report success so bots learn nothing.
  if (typeof body === "object" && body !== null && "website" in body && (body as { website?: unknown }).website) {
    return json({ ok: true });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "validation", fieldErrors: z.flattenError(parsed.error).fieldErrors }, 422);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return json({ error: "email_not_configured" }, 503);

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
    to: process.env.CONTACT_TO_EMAIL || site.email,
    replyTo: parsed.data.email,
    subject: buildEmailSubject(parsed.data),
    text: buildEmailText(parsed.data),
  });

  if (error) {
    console.error("contact: email provider rejected the message:", error.name);
    return json({ error: "send_failed" }, 502);
  }
  return json({ ok: true });
}
