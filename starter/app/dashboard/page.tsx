// Simple admin dashboard. Gate: /dashboard?key=YOUR_ADMIN_KEY
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { db } from "@/lib/db";

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="text-3xl font-extrabold text-stone-900">{value}</div>
      <div className="mt-1 text-sm font-medium text-stone-500">{label}</div>
      {hint && <div className="mt-0.5 text-xs text-stone-400">{hint}</div>}
    </div>
  );
}

const CHANNEL_BADGE: Record<string, string> = {
  email: "bg-blue-100 text-blue-800",
  whatsapp: "bg-green-100 text-green-800",
  messenger: "bg-indigo-100 text-indigo-800",
  instagram: "bg-pink-100 text-pink-800",
};
const STATUS_BADGE: Record<string, string> = {
  new: "bg-stone-100 text-stone-700",
  engaged: "bg-amber-100 text-amber-800",
  converted: "bg-emerald-100 text-emerald-800",
  unsubscribed: "bg-red-100 text-red-700",
};

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  if (key !== process.env.ADMIN_KEY) {
    return (
      <main className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="text-xl font-bold">🔒 Dashboard locked</h1>
        <p className="mt-2 text-stone-600">
          Open this page with your admin key: <code>/dashboard?key=YOUR_ADMIN_KEY</code>
        </p>
      </main>
    );
  }

  const weekAgo = new Date(Date.now() - 7 * 86_400_000);
  const [total, newThisWeek, unsub, clickedLeads, byChannel, leads] = await Promise.all([
    db.lead.count(),
    db.lead.count({ where: { createdAt: { gte: weekAgo } } }),
    db.lead.count({ where: { status: "unsubscribed" } }),
    db.event.findMany({ where: { type: "clicked" }, distinct: ["leadId"], select: { leadId: true } }),
    db.lead.groupBy({ by: ["channel"], _count: true }),
    db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  const conversion = total ? Math.round((clickedLeads.length / total) * 100) : 0;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Campaign dashboard</h1>
      <p className="mt-1 text-stone-500">Leads, engagement, and conversion across all channels.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Total leads" value={total} />
        <Stat label="New this week" value={newThisWeek} />
        <Stat label="Conversion" value={`${conversion}%`} hint="clicked an offer link" />
        <Stat label="Unsubscribed" value={unsub} />
      </div>

      <h2 className="mt-10 text-lg font-bold">By channel</h2>
      <div className="mt-3 flex flex-wrap gap-3">
        {byChannel.map((c) => (
          <span key={c.channel} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${CHANNEL_BADGE[c.channel] || "bg-stone-100 text-stone-700"}`}>
            {c.channel}: {c._count}
          </span>
        ))}
        {byChannel.length === 0 && <span className="text-stone-400">No leads yet.</span>}
      </div>

      <h2 className="mt-10 text-lg font-bold">Recent leads</h2>
      <div className="mt-3 overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-left text-stone-600">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Contact</th>
              <th className="px-4 py-3 font-semibold">Channel</th>
              <th className="px-4 py-3 font-semibold">Source</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b border-stone-100 last:border-0">
                <td className="px-4 py-3">{l.name || "—"}</td>
                <td className="px-4 py-3 text-stone-600">{l.email || l.phone || l.psid || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${CHANNEL_BADGE[l.channel] || "bg-stone-100 text-stone-700"}`}>
                    {l.channel}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone-600">{l.source || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[l.status] || "bg-stone-100 text-stone-700"}`}>
                    {l.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone-500">{new Date(l.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                  No leads yet — submit the form on the home page to see one here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
