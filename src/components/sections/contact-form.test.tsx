// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { contactCopy } from "@/content/contact";

vi.mock("@/lib/contact", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/contact")>()),
  openMailClient: vi.fn(),
}));

import { openMailClient } from "@/lib/contact";
import { ContactForm } from "./contact-form";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Name"), "Test Person");
  await user.type(screen.getByLabelText("Email"), "test@example.com");
  await user.selectOptions(screen.getByLabelText("Project type"), "web-scraping");
  await user.type(screen.getByLabelText("Tell me about your project"), "I need listings from ten portals delivered daily.");
}

const send = (user: ReturnType<typeof userEvent.setup>) => user.click(screen.getByRole("button", { name: "Send message" }));

describe("ContactForm", () => {
  it("shows friendly errors, marks fields invalid and does not call the API", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<ContactForm />);

    await send(user);

    expect(await screen.findByText("Please enter your name")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address")).toBeInTheDocument();
    expect(screen.getByText("Choose a project type")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Name")).toHaveAttribute("aria-describedby", "contact-name-error");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts clean JSON without an empty budget and confirms success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<ContactForm />);

    await fillValid(user);
    await send(user);

    expect(await screen.findByText(/your message is on its way/i)).toBeInTheDocument();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/contact");
    expect(JSON.parse(init.body)).toEqual({
      name: "Test Person",
      email: "test@example.com",
      projectType: "web-scraping",
      message: "I need listings from ten portals delivered daily.",
      website: "",
    });
    expect(screen.getByLabelText("Name")).toHaveValue("");
  });

  it("falls back to the visitor's mail client when the server has no email configured", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({ error: "email_not_configured" }) }));
    const user = userEvent.setup();
    render(<ContactForm />);

    await fillValid(user);
    await send(user);

    expect(await screen.findByText(/Email isn't configured on the server yet/)).toBeInTheDocument();
    expect(openMailClient).toHaveBeenCalledWith(expect.stringMatching(/^mailto:/));
    expect(screen.getByRole("link", { name: /open email app again/i })).toHaveAttribute("href", expect.stringMatching(/^mailto:/));
  });

  it("explains rate limiting", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 429, json: async () => ({}) }));
    const user = userEvent.setup();
    render(<ContactForm />);

    await fillValid(user);
    await send(user);

    expect(await screen.findByRole("alert")).toHaveTextContent(/too many messages/i);
  });

  it("shows a generic error when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const user = userEvent.setup();
    render(<ContactForm />);

    await fillValid(user);
    await send(user);

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/something went wrong/i));
  });

  it("announces the submitting state, keeps focus on the button and ignores a second submit while pending", async () => {
    let resolveFetch: (value: { ok: boolean; status: number }) => void = () => {};
    const fetchMock = vi.fn().mockReturnValue(new Promise((resolve) => (resolveFetch = resolve)));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    const { container } = render(<ContactForm />);

    await fillValid(user);
    await send(user);

    const region = container.querySelector('[aria-live="polite"]');
    expect(region).toHaveTextContent(contactCopy.sendingStatus);
    const button = screen.getByRole("button", { name: contactCopy.submitting });
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).not.toHaveAttribute("disabled");
    expect(button).toHaveFocus();

    await user.click(button);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveFetch({ ok: true, status: 200 });
    expect(await screen.findByText(/your message is on its way/i)).toBeInTheDocument();
    expect(region).not.toHaveTextContent(contactCopy.sendingStatus);
    expect(screen.getByRole("button", { name: "Send message" })).toHaveAttribute("aria-disabled", "false");
  });

  it("shows server field errors from a 422 and focuses the first invalid field", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: async () => ({ error: "validation", fieldErrors: { message: ["Server rejected the message"], email: ["Server rejected the email"] } }),
      }),
    );
    const user = userEvent.setup();
    render(<ContactForm />);

    await fillValid(user);
    await send(user);

    expect(await screen.findByText("Server rejected the email")).toBeInTheDocument();
    expect(screen.getByText("Server rejected the message")).toBeInTheDocument();
    const email = screen.getByLabelText("Email");
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAttribute("aria-describedby", "contact-email-error");
    await waitFor(() => expect(email).toHaveFocus());
  });

  it.each([
    ["an empty fieldErrors object", { error: "validation", fieldErrors: {} }],
    ["no fieldErrors at all", { error: "validation" }],
    ["only unknown field names", { error: "validation", fieldErrors: { website: ["nope"] } }],
  ])("shows a generic error in the live region when a 422 carries %s", async (_label, body) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 422, json: async () => body }));
    const user = userEvent.setup();
    const { container } = render(<ContactForm />);

    await fillValid(user);
    await send(user);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(contactCopy.error);
    expect(container.querySelector('[aria-live="polite"]')).toContainElement(alert);
    expect(screen.getByLabelText("Name")).not.toHaveAttribute("aria-invalid", "true");
  });
});
