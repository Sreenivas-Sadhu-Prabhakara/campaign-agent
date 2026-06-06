// Send all three email templates to yourself for a visual check.
//   GET /api/test-send?key=ADMIN_KEY&to=you@email.com
export const runtime = "nodejs";

import { sendEmail } from "@/lib/email";
import { STEPS } from "@/lib/content";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("key") !== process.env.ADMIN_KEY) {
    return new Response("Unauthorized", { status: 401 });
  }
  const to = searchParams.get("to");
  if (!to) return Response.json({ error: "Add ?to=you@email.com" }, { status: 400 });

  const lead = { id: "test", name: "Test Lead", email: to };
  for (const step of STEPS) await sendEmail(lead, step);

  return Response.json({ ok: true, sent: STEPS.length, to });
}
