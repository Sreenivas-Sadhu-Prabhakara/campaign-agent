// Meta Graph helpers for Facebook/Instagram Lead Ads + Messenger/IG DMs.
import crypto from "crypto";

const GRAPH = `https://graph.facebook.com/${process.env.GRAPH_VERSION || "v21.0"}`;
const PAGE_TOKEN = process.env.META_PAGE_ACCESS_TOKEN || "";
const APP_SECRET = process.env.META_APP_SECRET || "";

// Verify the X-Hub-Signature-256 header Meta sends with every webhook POST.
// Returns true if no APP_SECRET is configured (so local testing still works).
export function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!APP_SECRET) return true;
  if (!signature) return false;
  const expected =
    "sha256=" + crypto.createHmac("sha256", APP_SECRET).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

// Lead Ads: given a leadgen_id from the webhook, fetch the submitted field data.
export async function fetchLeadgen(leadgenId: string): Promise<{
  name: string | null;
  email: string | null;
  phone: string | null;
}> {
  const res = await fetch(
    `${GRAPH}/${leadgenId}?fields=field_data&access_token=${PAGE_TOKEN}`
  );
  if (!res.ok) throw new Error(`Leadgen fetch failed (${res.status}): ${await res.text()}`);
  const data = (await res.json()) as { field_data?: { name: string; values: string[] }[] };
  const get = (key: string) =>
    data.field_data?.find((f) => f.name === key || f.name.includes(key))?.values?.[0] ?? null;
  return {
    name: get("full_name") || get("name"),
    email: get("email"),
    phone: get("phone_number") || get("phone"),
  };
}

// Send a Messenger or Instagram DM (only reliable within the 24h window or
// with an approved message tag). channel: "messenger" | "instagram".
export async function sendDM(psid: string, text: string, channel: string) {
  if (!PAGE_TOKEN) throw new Error("META_PAGE_ACCESS_TOKEN not set");
  const res = await fetch(`${GRAPH}/me/messages?access_token=${PAGE_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: psid },
      messaging_type: "RESPONSE",
      message: { text },
    }),
  });
  if (!res.ok) throw new Error(`${channel} DM failed (${res.status}): ${await res.text()}`);
  return res.json();
}
