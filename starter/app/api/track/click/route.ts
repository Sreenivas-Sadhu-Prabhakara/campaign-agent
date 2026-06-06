// Email click tracking: logs a "clicked" event then redirects to the real URL.
export const runtime = "nodejs";

import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lead = searchParams.get("lead");
  const step = searchParams.get("e") || "unknown";
  const dest = searchParams.get("url") || process.env.APP_URL || "https://example.com";

  if (lead) {
    await db.event
      .create({ data: { leadId: lead, channel: "email", type: "clicked", step } })
      .catch(() => {});
    await db.lead
      .updateMany({
        where: { id: lead, status: { in: ["new", "engaged"] } },
        data: { status: "engaged" },
      })
      .catch(() => {});
  }

  return Response.redirect(dest, 302);
}
