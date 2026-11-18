const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_REQUEST_BYTES = 4096;

interface IncomingPayload {
  request_id?: unknown;
  name?: unknown;
  email?: unknown;
  message?: unknown;
  website?: unknown;
}

function buildCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const configuredOrigin =
    Deno.env.get("ALLOWED_ORIGIN") ?? "https://prime3436.github.io";
  const allowedOrigins = configuredOrigin
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const matchedOrigin =
    requestOrigin && allowedOrigins.includes(requestOrigin)
      ? requestOrigin
      : allowedOrigins[0] ?? "https://prime3436.github.io";

  return {
    "Access-Control-Allow-Origin": matchedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  corsHeaders: Record<string, string>
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

Deno.serve(async (req: Request): Promise<Response> => {
  const origin = req.headers.get("Origin");
  const corsHeaders = buildCorsHeaders(origin);
  const url = new URL(req.url);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (
    !url.pathname.endsWith("/contact-submit") &&
    !url.pathname.endsWith("/contact-submit/")
  ) {
    return jsonResponse({ error: "Not found." }, 404, corsHeaders);
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405, corsHeaders);
  }

  const rawText = await req.text();
  const byteLength = new TextEncoder().encode(rawText).length;

  if (byteLength === 0 || byteLength > MAX_REQUEST_BYTES) {
    return jsonResponse(
      { error: "Request payload size is invalid or exceeds 4096 bytes." },
      413,
      corsHeaders
    );
  }

  let parsed: IncomingPayload;
  try {
    parsed = JSON.parse(rawText) as IncomingPayload;
  } catch {
    return jsonResponse({ error: "Malformed JSON body." }, 400, corsHeaders);
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return jsonResponse({ error: "Invalid request payload." }, 400, corsHeaders);
  }

  const requestId =
    typeof parsed.request_id === "string" ? parsed.request_id.trim() : "";
  const name = typeof parsed.name === "string" ? parsed.name.trim() : "";
  const email = typeof parsed.email === "string" ? parsed.email.trim() : "";
  const message =
    typeof parsed.message === "string" ? parsed.message.trim() : "";
  const website =
    typeof parsed.website === "string" ? parsed.website : undefined;

  if (!UUID_REGEX.test(requestId)) {
    return jsonResponse(
      { error: "Invalid request_id UUID format." },
      400,
      corsHeaders
    );
  }

  if (website !== "") {
    console.info(
      JSON.stringify({
        event: "contact_submit_honeypot_rejected",
        request_id: requestId,
      })
    );
    return jsonResponse(
      { error: "Submission rejected.", request_id: requestId },
      400,
      corsHeaders
    );
  }

  if (name.length < 2 || name.length > 80) {
    return jsonResponse(
      {
        error: "Name must be between 2 and 80 characters.",
        request_id: requestId,
      },
      400,
      corsHeaders
    );
  }

  if (email.length === 0 || email.length > 254 || !EMAIL_REGEX.test(email)) {
    return jsonResponse(
      {
        error: "Email must be a valid address up to 254 characters.",
        request_id: requestId,
      },
      400,
      corsHeaders
    );
  }

  if (message.length < 10 || message.length > 1000) {
    return jsonResponse(
      {
        error: "Message must be between 10 and 1000 characters.",
        request_id: requestId,
      },
      400,
      corsHeaders
    );
  }

  const windmillWebhookUrl = Deno.env.get("WINDMILL_FLOW_WEBHOOK_URL");
  const windmillToken = Deno.env.get("WINDMILL_WEBHOOK_TOKEN");

  if (!windmillWebhookUrl || !windmillToken) {
    console.error(
      JSON.stringify({
        event: "contact_submit_config_missing",
        request_id: requestId,
      })
    );
    return jsonResponse(
      {
        error: "Intake orchestration is not configured.",
        request_id: requestId,
      },
      503,
      corsHeaders
    );
  }

  try {
    const windmillResponse = await fetch(windmillWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${windmillToken}`,
      },
      body: JSON.stringify({
        request_id: requestId,
        name,
        email,
        message,
      }),
    });

    let windmillPayload: Record<string, unknown> | null = null;
    try {
      windmillPayload = (await windmillResponse.json()) as Record<
        string,
        unknown
      >;
    } catch {
      windmillPayload = null;
    }

    const confirmed =
      windmillResponse.ok &&
      windmillPayload !== null &&
      windmillPayload.stored === true &&
      windmillPayload.request_id === requestId;

    if (!confirmed) {
      console.error(
        JSON.stringify({
          event: "contact_submit_windmill_unconfirmed",
          request_id: requestId,
          upstream_status: windmillResponse.status,
        })
      );
      return jsonResponse(
        {
          error:
            "Downstream workflow did not confirm durable storage. Please retry.",
          request_id: requestId,
        },
        502,
        corsHeaders
      );
    }

    console.info(
      JSON.stringify({
        event: "contact_submit_stored",
        request_id: requestId,
        status: "received",
      })
    );

    return jsonResponse(
      {
        request_id: requestId,
        status: "received",
      },
      200,
      corsHeaders
    );
  } catch {
    console.error(
      JSON.stringify({
        event: "contact_submit_windmill_unreachable",
        request_id: requestId,
      })
    );
    return jsonResponse(
      {
        error:
          "Intake workflow is temporarily unreachable. Your request ID is preserved for retry.",
        request_id: requestId,
      },
      502,
      corsHeaders
    );
  }
});
