"use client";

import { CircleAlert, CircleCheck, LoaderCircle, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { budgetLabels, budgetValues, contactCopy, projectTypeLabels, projectTypeValues } from "@/content/contact";
import { cn } from "@/lib/cn";
import { buildMailto, contactSchema, openMailClient } from "@/lib/contact";

type Status = "idle" | "submitting" | "success" | "fallback" | "error" | "rate-limited";
type FieldName = "name" | "email" | "projectType" | "budget" | "message";
type FieldErrors = Partial<Record<FieldName, string[]>>;

const control =
  "mt-2 block min-h-11 w-full rounded-lg border border-line bg-bg px-3.5 py-2.5 text-base text-fg placeholder:text-muted transition-colors focus:border-accent aria-[invalid=true]:border-danger";
const label = "text-sm font-medium";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [mailto, setMailto] = useState<string | null>(null);

  const a11y = (name: FieldName) => ({
    id: `contact-${name}`,
    name,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `contact-${name}-error` : undefined,
  });
  const fieldError = (name: FieldName) =>
    errors[name] ? (
      <p id={`contact-${name}-error`} className="mt-1.5 text-sm text-danger">
        {errors[name]?.[0]}
      </p>
    ) : null;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const raw = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const parsed = contactSchema.safeParse({
      name: raw.name,
      email: raw.email,
      projectType: raw.projectType,
      budget: raw.budget || undefined,
      message: raw.message,
      website: raw.website ?? "",
    });

    if (!parsed.success) {
      setErrors(z.flattenError(parsed.error).fieldErrors as FieldErrors);
      setStatus("idle");
      requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }

    setErrors({});
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (res.ok) {
        form.reset();
        setStatus("success");
        return;
      }
      if (res.status === 503) {
        const href = buildMailto(parsed.data);
        setMailto(href);
        setStatus("fallback");
        openMailClient(href);
        return;
      }
      if (res.status === 422) {
        const data = await res.json();
        setErrors((data.fieldErrors ?? {}) as FieldErrors);
        setStatus("idle");
        return;
      }
      setStatus(res.status === 429 ? "rate-limited" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={label}>{contactCopy.fields.name}</label>
          <input type="text" autoComplete="name" required placeholder={contactCopy.placeholders.name} className={control} {...a11y("name")} />
          {fieldError("name")}
        </div>
        <div>
          <label htmlFor="contact-email" className={label}>{contactCopy.fields.email}</label>
          <input type="email" autoComplete="email" required placeholder={contactCopy.placeholders.email} className={control} {...a11y("email")} />
          {fieldError("email")}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-projectType" className={label}>{contactCopy.fields.projectType}</label>
          <select required defaultValue="" className={control} {...a11y("projectType")}>
            <option value="" disabled>{contactCopy.placeholders.projectType}</option>
            {projectTypeValues.map((v) => (
              <option key={v} value={v}>{projectTypeLabels[v]}</option>
            ))}
          </select>
          {fieldError("projectType")}
        </div>
        <div>
          <label htmlFor="contact-budget" className={label}>{contactCopy.fields.budget}</label>
          <select defaultValue="" className={control} {...a11y("budget")}>
            <option value="">{contactCopy.placeholders.budget}</option>
            {budgetValues.map((v) => (
              <option key={v} value={v}>{budgetLabels[v]}</option>
            ))}
          </select>
          {fieldError("budget")}
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className={label}>{contactCopy.fields.message}</label>
        <textarea rows={5} required placeholder={contactCopy.placeholders.message} className={cn(control, "resize-y")} {...a11y("message")} />
        {fieldError("message")}
      </div>

      {/* Honeypot: hidden from people and assistive tech, tempting to bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-accent-fg transition-[transform,filter] duration-200 hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {status === "submitting" ? (
          <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
        ) : (
          <Send className="size-4" aria-hidden />
        )}
        {status === "submitting" ? contactCopy.submitting : contactCopy.submit}
      </button>

      <div aria-live="polite" className="min-h-6">
        {status === "success" ? (
          <p role="status" className="flex items-start gap-2 text-sm text-ok">
            <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
            {contactCopy.success}
          </p>
        ) : null}
        {status === "fallback" && mailto ? (
          <p role="status" className="flex items-start gap-2 text-sm text-fg">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
            <span>
              {contactCopy.fallback}{" "}
              <a href={mailto} className="font-medium text-accent underline underline-offset-2">
                Open email app again
              </a>
            </span>
          </p>
        ) : null}
        {status === "error" || status === "rate-limited" ? (
          <p role="alert" className="flex items-start gap-2 text-sm text-danger">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {status === "error" ? contactCopy.error : contactCopy.rateLimited}
          </p>
        ) : null}
      </div>
    </form>
  );
}
