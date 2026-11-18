import * as wmill from "npm:windmill-client@1";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function main(
  request_id: string,
  name: string,
  email: string,
  message: string
): Promise<{ stored: boolean; request_id: string }> {
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

  const baseUrl = "https://zuhjpdhxjhysrzyjtbhv.supabase.co";
  let serviceKey = "";
  for (const p of [
    "u/patibandla/SUPABASE_SERVICE_ROLE_KEY",
    "u/prime3437/SUPABASE_SERVICE_ROLE_KEY",
    "f/contact/SUPABASE_SERVICE_ROLE_KEY",
  ]) {
    try {
      const val = await wmill.getVariable(p);
      if (val) {
        serviceKey = val.trim();
        break;
      }
    } catch {}
  }

  if (!serviceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY variable in Windmill.");
  }

  const authHeaders: Record<string, string> = {
    apikey: serviceKey,
  };
  if (serviceKey.startsWith("eyJ")) {
    authHeaders["Authorization"] = `Bearer ${serviceKey}`;
  }

  const endpoint = `${baseUrl}/rest/v1/contact_submissions?on_conflict=request_id`;
  const insertResponse = await fetch(endpoint, {
    method: "POST",
    headers: {
      ...authHeaders,
      "Content-Type": "application/json",
      Prefer: "resolution=ignore-duplicates,return=representation",
    },
    body: JSON.stringify({
      request_id: cleanId,
      name: cleanName,
      email: cleanEmail,
      message: cleanMessage,
    }),
  });

  if (!insertResponse.ok) {
    const errText = await insertResponse.text();
    throw new Error(
      `Supabase insert failed (${insertResponse.status}): ${errText}`
    );
  }

  const insertedRows = (await insertResponse.json()) as Array<{
    request_id: string;
  }>;
  if (Array.isArray(insertedRows) && insertedRows.length === 1) {
    return { stored: true, request_id: insertedRows[0].request_id };
  }

  const lookupUrl = `${baseUrl}/rest/v1/contact_submissions?request_id=eq.${encodeURIComponent(
    cleanId
  )}&select=request_id`;
  const lookupResponse = await fetch(lookupUrl, {
    method: "GET",
    headers: {
      ...authHeaders,
      Accept: "application/json",
    },
  });

  if (!lookupResponse.ok) {
    throw new Error(`Supabase lookup failed: ${lookupResponse.status}`);
  }

  const existingRows = (await lookupResponse.json()) as Array<{
    request_id: string;
  }>;
  if (!Array.isArray(existingRows) || existingRows.length !== 1) {
    throw new Error("Record confirmation failed.");
  }

  return { stored: true, request_id: existingRows[0].request_id };
}
