import { z } from "zod";
import { budgetLabels, budgetValues, contactCopy, projectTypeLabels, projectTypeValues } from "@/content/contact";
import { site } from "@/content/site";

export const contactSchema = z.object({
  // No line breaks: the name goes into the email subject, where CR/LF would inject headers or split the line.
  name: z.string().trim().min(2, contactCopy.validation.name).max(80).regex(/^[^\r\n]*$/, contactCopy.validation.name),
  email: z.string().trim().max(120).pipe(z.email(contactCopy.validation.email)),
  projectType: z.enum(projectTypeValues, { error: contactCopy.validation.projectType }),
  budget: z.enum(budgetValues).optional(),
  message: z.string().trim().min(20, contactCopy.validation.message).max(4000),
  /** Honeypot: real visitors never see or fill this. The server treats any value as spam. */
  website: z.string().max(200).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export function buildEmailSubject(d: ContactInput): string {
  return `New project enquiry: ${projectTypeLabels[d.projectType]} (${d.name})`;
}

export function buildEmailText(d: ContactInput): string {
  return [
    `Name: ${d.name}`,
    `Email: ${d.email}`,
    `Project type: ${projectTypeLabels[d.projectType]}`,
    `Budget: ${d.budget ? budgetLabels[d.budget] : "Not specified"}`,
    "",
    d.message,
  ].join("\n");
}

export function buildMailto(d: ContactInput): string {
  return `mailto:${site.email}?subject=${encodeURIComponent(buildEmailSubject(d))}&body=${encodeURIComponent(buildEmailText(d))}`;
}

/** Hands the message to the visitor's mail client. Separate from the form so tests can replace it. */
export function openMailClient(url: string): void {
  window.location.assign(url);
}
