// Drip engine. Run daily (Vercel Cron). Sends Day-2 "value" and Day-5 "offer"
// on each lead's channel, skipping anyone who already got that step or unsubscribed.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { sendStep } from "@/lib/messaging";

const DAY = 86_400_000;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const leads = await db.lead.findMany({
    where: { status: { not: "unsubscribed" } },
    include: { events: true },
  });

  const now = Date.now();
  let sent = 0;
  const errors: string[] = [];

  for (const lead of leads) {
    const ageDays = (now - new Date(lead.createdAt).getTime()) / DAY;
    const sentSteps = new Set(
      lead.events.filter((e) => e.type === "sent").map((e) => e.step)
    );
    try {
      if (ageDays >= 2 && !sentSteps.has("value")) {
        await sendStep(lead, "value");
        sent++;
      } else if (ageDays >= 5 && !sentSteps.has("offer")) {
        await sendStep(lead, "offer");
        sent++;
      }
    } catch (e) {
      errors.push(`${lead.id} (${lead.channel}): ${(e as Error).message}`);
    }
  }

  return Response.json({ ok: true, leads: leads.length, sent, errors });
}
