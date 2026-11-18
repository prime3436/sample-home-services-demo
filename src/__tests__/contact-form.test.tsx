import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import App from "@/App";
import { validateContactInput } from "@/lib/contact";

describe("Sample Home Services — Demo", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders title, demonstration notice, three service cards, and Contact Us button", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: "Sample Home Services — Demo",
        level: 1,
      })
    ).toBeInTheDocument();

    const notices = screen.getAllByText(
      "Demonstration only — no services offered"
    );
    expect(notices.length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText("Small Repairs")).toBeInTheDocument();
    expect(screen.getByText("Furniture Assembly")).toBeInTheDocument();
    expect(screen.getByText("Home Maintenance")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Contact Us" })
    ).toBeInTheDocument();
  });

  it("rejects blank, malformed, or oversized form fields without calling fetch", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Contact Us" }));

    expect(await screen.findByText("Name is required.")).toBeInTheDocument();
    expect(
      await screen.findByText("Email address is required.")
    ).toBeInTheDocument();
    expect(await screen.findByText("Message is required.")).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("Name"), "A");
    await user.type(screen.getByLabelText("Email"), "invalid-email");
    await user.type(screen.getByLabelText("Message"), "Too short");
    await user.click(screen.getByRole("button", { name: "Contact Us" }));

    expect(
      await screen.findByText("Name must be between 2 and 80 characters.")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Enter a valid email address.")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Message must be between 10 and 1000 characters.")
    ).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();

    const oversizedErrors = validateContactInput({
      request_id: "550e8400-e29b-41d4-a716-446655440000",
      name: "A".repeat(81),
      email: `${"a".repeat(245)}@example.com`,
      message: "M".repeat(1001),
      website: "",
    });
    expect(oversizedErrors.name).toBe(
      "Name must be between 2 and 80 characters."
    );
    expect(oversizedErrors.email).toBe(
      "Email address must be 254 characters or fewer."
    );
    expect(oversizedErrors.message).toBe(
      "Message must be between 10 and 1000 characters."
    );
  });

  it("preserves request_id when service is unavailable and succeeds on retry without changing request_id", async () => {
    let callCount = 0;
    const capturedRequestIds: string[] = [];

    vi.spyOn(globalThis, "fetch").mockImplementation(async (_url, init) => {
      callCount += 1;
      const parsed = JSON.parse(String(init?.body)) as { request_id: string };
      capturedRequestIds.push(parsed.request_id);

      if (callCount === 1) {
        return new Response(
          JSON.stringify({ error: "Windmill flow temporarily unreachable." }),
          { status: 502, headers: { "Content-Type": "application/json" } }
        );
      }

      if (callCount === 2) {
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          request_id: parsed.request_id,
          status: "received",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    });

    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText("Name"), "Jordan Patel");
    await user.type(screen.getByLabelText("Email"), "jordan.patel@example.com");
    await user.type(
      screen.getByLabelText("Message"),
      "Need two bookshelves assembled and anchored to the study wall."
    );

    await user.click(screen.getByRole("button", { name: "Contact Us" }));

    expect(
      await screen.findByTestId("submission-error")
    ).toHaveTextContent("Windmill flow temporarily unreachable.");

    await user.click(screen.getByRole("button", { name: "Contact Us" }));

    expect(
      await screen.findByTestId("submission-error")
    ).toHaveTextContent("Submission could not be stored right now.");

    await user.click(screen.getByRole("button", { name: "Contact Us" }));

    await waitFor(() => {
      expect(screen.getByText("Inquiry Received")).toBeInTheDocument();
    });

    expect(capturedRequestIds).toHaveLength(3);
    expect(capturedRequestIds[0]).toBe(capturedRequestIds[1]);
    expect(capturedRequestIds[1]).toBe(capturedRequestIds[2]);
    expect(screen.getByTestId("confirmed-request-id")).toHaveTextContent(
      capturedRequestIds[0]
    );
  });
});
