import { describe, expect, it } from "vitest";
import { z } from "zod";
import { site } from "@/content/site";
import { buildEmailSubject, buildEmailText, buildMailto, contactSchema } from "./contact";

const valid = {
  name: "  Test Person ",
  email: " test@example.com ",
  projectType: "web-scraping",
  message: "I need listings from ten portals delivered daily.",
};

describe("contactSchema", () => {
  it("accepts a valid submission and trims text fields", () => {
    const r = contactSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("Test Person");
      expect(r.data.email).toBe("test@example.com");
    }
  });

  it("returns friendly messages for each invalid field", () => {
    const r = contactSchema.safeParse({ name: "A", email: "nope", projectType: "", message: "short" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const fields = z.flattenError(r.error).fieldErrors;
      expect(fields.name?.[0]).toBe("Please enter your name");
      expect(fields.email?.[0]).toBe("Enter a valid email address");
      expect(fields.projectType?.[0]).toBe("Choose a project type");
      expect(fields.message?.[0]).toContain("at least 20 characters");
    }
  });

  it.each([["LF", "Test\nPerson"], ["CRLF", "Test\r\nBcc: victim@example.com"], ["CR", "Test\rPerson"]])(
    "rejects a name containing a %s line break with the friendly message",
    (_label, name) => {
      const r = contactSchema.safeParse({ ...valid, name });
      expect(r.success).toBe(false);
      if (!r.success) expect(z.flattenError(r.error).fieldErrors.name?.[0]).toBe("Please enter your name");
    },
  );

  it("still accepts a name with an ordinary internal space", () => {
    expect(contactSchema.safeParse({ ...valid, name: "Mary Jane Watson" }).success).toBe(true);
  });

  it("treats budget as optional but rejects unknown values", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
    expect(contactSchema.safeParse({ ...valid, budget: "under-2k" }).success).toBe(true);
    expect(contactSchema.safeParse({ ...valid, budget: "lots" }).success).toBe(false);
  });

  it("rejects an over-long message", () => {
    expect(contactSchema.safeParse({ ...valid, message: "x".repeat(4001) }).success).toBe(false);
  });
});

describe("mail helpers", () => {
  const data = contactSchema.parse({ ...valid, budget: "2k-5k" });

  it("writes a readable subject and body", () => {
    expect(buildEmailSubject(data)).toBe("New project enquiry: Web scraping (Test Person)");
    const text = buildEmailText(data);
    expect(text).toContain("Name: Test Person");
    expect(text).toContain("Budget: $2k to $5k");
    expect(text).toContain(data.message);
  });

  it("marks a missing budget as not specified", () => {
    expect(buildEmailText(contactSchema.parse(valid))).toContain("Budget: Not specified");
  });

  it("builds a mailto link that round-trips", () => {
    const url = buildMailto(data);
    expect(url.startsWith(`mailto:${site.email}?subject=`)).toBe(true);
    const params = new URLSearchParams(url.split("?")[1]);
    expect(params.get("subject")).toBe(buildEmailSubject(data));
    expect(params.get("body")).toBe(buildEmailText(data));
  });
});
