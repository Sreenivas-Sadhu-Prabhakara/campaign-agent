// Web capture form -> create/update lead -> send welcome on their channel.
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendStep } from "@/lib/messaging";

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export async function POST(req: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { name, email, phone, source, website } = payload as Record<string, string>;

  // Honeypot: bots fill the hidden "website" field. Pretend success, save nothing.
  if (website) return NextResponse.json({ ok: true });

  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const cleanPhone = typeof phone === "string" ? phone.replace(/[^\d+]/g, "") : "";

  if (!cleanEmail && !cleanPhone) {
    return NextResponse.json({ error: "Enter an email or WhatsApp number." }, { status: 400 });
  }
  if (cleanEmail && !isEmail(cleanEmail)) {
    return NextResponse.json({ error: "That email looks invalid." }, { status: 400 });
  }

  // If they gave an email we reach them by email; otherwise by WhatsApp.
  const channel = cleanEmail ? "email" : "whatsapp";

  let lead;
  if (cleanEmail) {
    lead = await db.lead.upsert({
      where: { email: cleanEmail },
      update: { name: name || undefined, phone: cleanPhone || undefined },
      create: {
        email: cleanEmail,
        phone: cleanPhone || null,
        name: name || null,
        channel,
        source: source || "homepage",
      },
    });
  } else {
    lead =
      (await db.lead.findFirst({ where: { phone: cleanPhone } })) ??
      (await db.lead.create({
        data: { phone: cleanPhone, name: name || null, channel, source: source || "homepage" },
      }));
  }

  // Fire the welcome. Don't fail the request if the provider is misconfigured.
  try {
    await sendStep(lead, "welcome");
  } catch (e) {
    console.error("welcome send failed:", e);
  }

  return NextResponse.json({ ok: true });
}
