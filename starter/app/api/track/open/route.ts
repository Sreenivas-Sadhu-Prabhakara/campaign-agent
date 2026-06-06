// Email open tracking: returns a 1x1 transparent GIF and logs an "opened" event.
export const runtime = "nodejs";

import { db } from "@/lib/db";

const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lead = searchParams.get("lead");
  const step = searchParams.get("e") || "unknown";

  if (lead) {
    await db.event
      .create({ data: { leadId: lead, channel: "email", type: "opened", step } })
      .catch(() => {});
    await db.lead
      .updateMany({ where: { id: lead, status: "new" }, data: { status: "engaged" } })
      .catch(() => {});
  }

  return new Response(PIXEL, {
    headers: { "Content-Type": "image/gif", "Cache-Control": "no-store, max-age=0" },
  });
}
