import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));

import { POST } from "./route";

const valid = {
  name: "Test Person",
  email: "test@example.com",
  projectType: "web-scraping",
  message: "I need listings from ten portals delivered daily to Postgres.",
};

let counter = 0;
function post(body: unknown, ip = `10.0.0.${++counter}`) {
  return POST(
    new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  send.mockReset();
  send.mockResolvedValue({ data: { id: "1" }, error: null });
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("CONTACT_TO_EMAIL", "owner@example.com");
});
afterEach(() => vi.unstubAllEnvs());

describe("POST /api/contact", () => {
  it("emails the owner with the visitor as reply-to", async () => {
    const res = await post(valid);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "owner@example.com",
        replyTo: "test@example.com",
        subject: expect.stringContaining("Web scraping"),
        text: expect.stringContaining(valid.message),
      }),
    );
  });

  it("returns 422 with field errors for invalid input", async () => {
    const res = await post({ ...valid, email: "nope" });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error).toBe("validation");
    expect(body.fieldErrors.email).toBeTruthy();
    expect(send).not.toHaveBeenCalled();
  });

  it("returns 400 for a body that is not JSON", async () => {
    expect((await post("not json")).status).toBe(400);
  });

  it("pretends success but sends nothing when the honeypot is filled", async () => {
    const res = await post({ ...valid, website: "http://spam.example" });
    expect(res.status).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });

  it("returns 503 so the client can fall back to the mail client when email is not configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const res = await post(valid);
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "email_not_configured" });
  });

  it("returns 502 when the email provider rejects the message", async () => {
    send.mockResolvedValue({ data: null, error: { name: "validation_error", message: "bad" } });
    expect((await post(valid)).status).toBe(502);
  });

  it("rate limits repeated submissions from one IP", async () => {
    const ip = "203.0.113.9";
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) statuses.push((await post(valid, ip)).status);
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
    const blocked = await post(valid, ip);
    expect(blocked.headers.get("retry-after")).toBeTruthy();
  });
});
