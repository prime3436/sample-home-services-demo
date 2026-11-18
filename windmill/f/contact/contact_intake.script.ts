const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ContactIntakeResult {
  stored: boolean;
  request_id: string;
}

export async function main(
  request_id: string,
  name: string,
  email: string,
  message: string,
  supabase_url?: string,
  supabase_service_role_key?: string
): Promise<ContactIntakeResult> {
  const cleanId = (request_id ?? "").trim();
  const cleanName = (name ?? "").trim();
  const cleanEmail = (email ?? "").trim();
  const cleanMessage = (message ?? "").trim();

  if (!UUID_REGEX.test(cleanId)) {
    throw new Error("Invalid request_id UUID format.");
  }
  if (cleanName.length < 2 || cleanName.length > 80) {
    throw new Error("Invalid name length.");
  }
  if (
    cleanEmail.length === 0 ||
    cleanEmail.length > 254 ||
    !EMAIL_REGEX.test(cleanEmail)
  ) {
    throw new Error("Invalid email format.");
  }
  if (cleanMessage.length < 10 || cleanMessage.length > 1000) {
    throw new Error("Invalid message length.");
  }

  const resolvedUrl = (
    supabase_url ||
    Deno.env.get("SUPABASE_URL") ||
    ""
  ).replace(/\/+$/, "");
  const resolvedKey =
    supabase_service_role_key ||
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
    "";

  if (!resolvedUrl || !resolvedKey) {
    throw new Error("Missing server-side Supabase credentials in Windmill.");
  }

  const endpoint = `${resolvedUrl}/rest/v1/contact_submissions?on_conflict=request_id`;

  const insertResponse = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": resolvedKey,
      "Authorization": `Bearer ${resolvedKey}`,
      "Prefer": "resolution=ignore-duplicates,return=representation",
    },
    body: JSON.stringify({
      request_id: cleanId,
      name: cleanName,
      email: cleanEmail,
      message: cleanMessage,
    }),
  });

  if (!insertResponse.ok) {
    console.error(
      JSON.stringify({
        event: "windmill_supabase_insert_failed",
        request_id: cleanId,
        status: insertResponse.status,
      })
    );
    throw new Error(
      `Supabase insert failed with status ${insertResponse.status}`
    );
  }

  const insertedRows = (await insertResponse.json()) as Array<{
    request_id: string;
  }>;

  if (Array.isArray(insertedRows) && insertedRows.length === 1) {
    console.info(
      JSON.stringify({
        event: "windmill_contact_intake_inserted",
        request_id: cleanId,
        duplicate: false,
      })
    );
    return {
      stored: true,
      request_id: insertedRows[0].request_id,
    };
  }

  const lookupUrl = `${resolvedUrl}/rest/v1/contact_submissions?request_id=eq.${encodeURIComponent(
    cleanId
  )}&select=request_id`;

  const lookupResponse = await fetch(lookupUrl, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "apikey": resolvedKey,
      "Authorization": `Bearer ${resolvedKey}`,
    },
  });

  if (!lookupResponse.ok) {
    throw new Error(
      `Supabase duplicate check failed with status ${lookupResponse.status}`
    );
  }

  const existingRows = (await lookupResponse.json()) as Array<{
    request_id: string;
  }>;

  if (!Array.isArray(existingRows) || existingRows.length !== 1) {
    throw new Error("Unable to confirm stored record in contact_submissions.");
  }

  console.info(
    JSON.stringify({
      event: "windmill_contact_intake_duplicate_preserved",
      request_id: cleanId,
      duplicate: true,
    })
  );

  return {
    stored: true,
    request_id: existingRows[0].request_id,
  };
}
