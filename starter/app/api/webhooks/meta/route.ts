// ONE webhook for all Meta channels:
//   - Facebook / Instagram Lead Ads  (capture name/email/phone)
//   - WhatsApp Cloud API inbound      (capture + auto-reply within 24h)
//   - Messenger / Instagram DMs       (capture + auto-reply within 24h)
//
// Configure this URL ( https://YOUR_APP/api/webhooks/meta ) in your Meta app
// and subscribe to: leadgen, messages, messaging_postbacks.
export const runtime = "nodejs";

import { db } from "@/lib/db";
import { sendStep } from "@/lib/messaging";
import { verifySignature, fetchLeadgen } from "@/lib/meta";

// ---- Webhook verification handshake (Meta calls this once on setup) ----
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    return new Response(challenge || "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

// ---- Event delivery ----
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifySignature(raw, req.headers.get("x-hub-signature-256"))) {
    return new Response("Bad signature", { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  try {
    if (body.object === "page" || body.object === "instagram") {
      const platform = body.object === "instagram" ? "instagram" : "facebook";
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === "leadgen") await handleLeadgen(change.value, platform);
        }
        for (const msg of entry.messaging || []) {
          await handleDM(msg, body.object === "instagram" ? "instagram" : "messenger");
        }
      }
    } else if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          for (const m of change.value?.messages || []) {
            await handleWhatsAppInbound(m, change.value);
          }
        }
      }
    }
  } catch (e) {
    console.error("webhook handler error:", e);
  }

  // Always 200 fast, or Meta will retry and eventually disable the webhook.
  return new Response("EVENT_RECEIVED", { status: 200 });
}

// ---- Handlers ----

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleLeadgen(value: any, source: string) {
  const info = await fetchLeadgen(value.leadgen_id);
  const email = info.email ? info.email.toLowerCase() : null;
  const phone = info.phone ? info.phone.replace(/[^\d+]/g, "") : null;
  if (!email && !phone) return;

  const channel = email ? "email" : "whatsapp";
  let lead;
  if (email) {
    lead = await db.lead.upsert({
      where: { email },
      update: { name: info.name || undefined, phone: phone || undefined },
      create: { email, phone, name: info.name, channel, source },
    });
  } else {
    lead =
      (await db.lead.findFirst({ where: { phone: phone! } })) ??
      (await db.lead.create({ data: { phone, name: info.name, channel, source } }));
  }
  try {
    await sendStep(lead, "welcome");
  } catch (e) {
    console.error("leadgen welcome failed:", e);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleDM(msg: any, channel: string) {
  const psid = msg.sender?.id;
  if (!psid || !msg.message) return;

  let lead = await db.lead.findFirst({ where: { psid } });
  const isNew = !lead;
  if (!lead) {
    lead = await db.lead.create({ data: { psid, name: null, channel, source: channel } });
  }
  await db.event.create({
    data: { leadId: lead.id, channel, type: "replied", step: "inbound" },
  });
  // They just messaged us, so we're inside the 24h window — welcome them.
  if (isNew) {
    try {
      await sendStep(lead, "welcome", { withinWindow: true });
    } catch (e) {
      console.error("DM welcome failed:", e);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleWhatsAppInbound(m: any, value: any) {
  if (!m.from) return;
  const phone = m.from.startsWith("+") ? m.from : `+${m.from}`;
  const name = value?.contacts?.[0]?.profile?.name || null;

  let lead = await db.lead.findFirst({ where: { phone } });
  const isNew = !lead;
  if (!lead) {
    lead = await db.lead.create({
      data: { phone, name, channel: "whatsapp", source: "whatsapp" },
    });
  }
  await db.event.create({
    data: { leadId: lead.id, channel: "whatsapp", type: "replied", step: "inbound" },
  });
  if (isNew) {
    try {
      await sendStep(lead, "welcome", { withinWindow: true });
    } catch (e) {
      console.error("WhatsApp welcome failed:", e);
    }
  }
}
