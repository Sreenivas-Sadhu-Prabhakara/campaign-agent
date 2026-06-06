// WhatsApp Cloud API helpers.
//
// IMPORTANT: To start a conversation (outbound drip), WhatsApp requires a
// PRE-APPROVED message template. Free-form text only works inside the 24h
// window after the user messages you. So:
//   - drip steps  -> sendTemplate()
//   - live replies -> sendText()  (only within 24h of their last message)

import { COPY, type Step } from "./content";

const GRAPH = `https://graph.facebook.com/${process.env.GRAPH_VERSION || "v21.0"}`;
const TOKEN = process.env.WHATSAPP_TOKEN || "";
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
const LANG = process.env.WHATSAPP_TEMPLATE_LANG || "en";

function templateName(step: Step) {
  return (
    process.env[`WHATSAPP_TEMPLATE_${step.toUpperCase()}`] || `lead_${step}`
  );
}

async function post(body: unknown) {
  if (!TOKEN || !PHONE_ID) throw new Error("WhatsApp not configured (set WHATSAPP_TOKEN + WHATSAPP_PHONE_NUMBER_ID)");
  const res = await fetch(`${GRAPH}/${PHONE_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", ...(body as object) }),
  });
  if (!res.ok) throw new Error(`WhatsApp send failed (${res.status}): ${await res.text()}`);
  return res.json();
}

// Outbound drip: send an approved template. {{1}} is filled with the lead's name.
export async function sendTemplate(to: string, step: Step, name: string | null) {
  return post({
    to,
    type: "template",
    template: {
      name: templateName(step),
      language: { code: LANG },
      components: [
        { type: "body", parameters: [{ type: "text", text: name || "there" }] },
      ],
    },
  });
}

// Free-form reply (only valid within the 24h customer-service window).
export async function sendText(to: string, text: string) {
  return post({ to, type: "text", text: { body: text } });
}

// Convenience: the plain-text body for a step (used for in-window replies).
export function stepText(step: Step, name: string | null) {
  return COPY[step].text({ name });
}
