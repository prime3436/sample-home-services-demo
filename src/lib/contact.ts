export interface ContactSubmissionPayload {
  request_id: string;
  name: string;
  email: string;
  message: string;
  website: string;
}

export interface ValidationErrors {
  name?: string;
  email?: string;
  message?: string;
  form?: string;
}

export interface ContactSubmissionResult {
  ok: boolean;
  request_id: string;
  status?: "received";
  error?: string;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MAX_REQUEST_BYTES = 4096;

export function generateRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function isValidUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function validateContactInput(input: {
  request_id: string;
  name: string;
  email: string;
  message: string;
  website: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};
  const trimmedName = input.name.trim();
  const trimmedEmail = input.email.trim();
  const trimmedMessage = input.message.trim();

  if (!trimmedName) {
    errors.name = "Name is required.";
  } else if (trimmedName.length < 2 || trimmedName.length > 80) {
    errors.name = "Name must be between 2 and 80 characters.";
  }

  if (!trimmedEmail) {
    errors.email = "Email address is required.";
  } else if (trimmedEmail.length > 254) {
    errors.email = "Email address must be 254 characters or fewer.";
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = "Enter a valid email address.";
  }

  if (!trimmedMessage) {
    errors.message = "Message is required.";
  } else if (trimmedMessage.length < 10 || trimmedMessage.length > 1000) {
    errors.message = "Message must be between 10 and 1000 characters.";
  }

  if (!isValidUuid(input.request_id)) {
    errors.form = "Invalid request identifier format.";
  }

  if (input.website !== "") {
    errors.form = "Submission rejected.";
  }

  const serialized = JSON.stringify({
    request_id: input.request_id,
    name: trimmedName,
    email: trimmedEmail,
    message: trimmedMessage,
    website: input.website,
  });

  if (new TextEncoder().encode(serialized).length > MAX_REQUEST_BYTES) {
    errors.form = "Total request size exceeds the 4 KB limit.";
  }

  return errors;
}

export async function submitContactInquiry(
  payload: ContactSubmissionPayload,
  endpointUrl?: string
): Promise<ContactSubmissionResult> {
  const resolvedEndpoint =
    endpointUrl ??
    import.meta.env.VITE_CONTACT_ENDPOINT_URL ??
    "/functions/v1/contact-submit";

  const normalizedPayload: ContactSubmissionPayload = {
    request_id: payload.request_id,
    name: payload.name.trim(),
    email: payload.email.trim(),
    message: payload.message.trim(),
    website: payload.website,
  };

  try {
    const response = await fetch(resolvedEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(normalizedPayload),
    });

    let body: Record<string, unknown> | null = null;
    try {
      body = (await response.json()) as Record<string, unknown>;
    } catch {
      body = null;
    }

    if (
      response.ok &&
      body !== null &&
      body.status === "received" &&
      body.request_id === normalizedPayload.request_id
    ) {
      return {
        ok: true,
        request_id: normalizedPayload.request_id,
        status: "received",
      };
    }

    const serverError =
      body && typeof body.error === "string"
        ? body.error
        : "Submission could not be stored right now. Your request ID is preserved so you can safely retry.";

    return {
      ok: false,
      request_id: normalizedPayload.request_id,
      error: serverError,
    };
  } catch {
    return {
      ok: false,
      request_id: normalizedPayload.request_id,
      error:
        "Unable to reach the intake service. Your request ID is preserved so you can safely retry without creating duplicates.",
    };
  }
}
