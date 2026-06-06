// Channel router: send a campaign step to a lead on whatever channel they're on,
// and record a "sent" Event. This is what /api/leads and /api/cron/drip call.
import type { Lead } from "@prisma/client";
import { db } from "./db";
import { sendEmail } from "./email";
import { sendTemplate, sendText } from "./whatsapp";
import { sendDM } from "./meta";
import { COPY, type Step } from "./content";

export async function sendStep(
  lead: Lead,
  step: Step,
  opts: { withinWindow?: boolean } = {}
) {
  switch (lead.channel) {
    case "email":
      if (!lead.email) throw new Error("lead has no email");
      await sendEmail({ id: lead.id, name: lead.name, email: lead.email }, step);
      break;

    case "whatsapp":
      if (!lead.phone) throw new Error("lead has no phone");
      // Inside the 24h window we can send free text; otherwise use a template.
      if (opts.withinWindow) await sendText(lead.phone, COPY[step].text(lead));
      else await sendTemplate(lead.phone, step, lead.name);
      break;

    case "messenger":
    case "instagram":
      if (!lead.psid) throw new Error("lead has no psid");
      await sendDM(lead.psid, COPY[step].text(lead), lead.channel);
      break;

    default:
      throw new Error(`unknown channel: ${lead.channel}`);
  }

  await db.event.create({
    data: { leadId: lead.id, channel: lead.channel, type: "sent", step },
  });
}
