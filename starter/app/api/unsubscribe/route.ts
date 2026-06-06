// One-click unsubscribe (required in every email footer).
export const runtime = "nodejs";

import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lead = searchParams.get("lead");

  if (lead) {
    await db.lead
      .update({ where: { id: lead }, data: { status: "unsubscribed" } })
      .catch(() => {});
  }

  return new Response(
    `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head>
     <body style="font-family:system-ui,sans-serif;text-align:center;padding:64px 24px;background:#f6f1e7;color:#211b13">
       <h1 style="margin:0 0 8px">You're unsubscribed</h1>
       <p style="color:#5d5340">You won't receive any more messages. Sorry to see you go.</p>
     </body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
