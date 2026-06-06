# Lead Campaign App — multi-channel starter

A ready-to-run **lead-generation campaign app**: capture leads from a web form,
**Facebook/Instagram Lead Ads**, and **WhatsApp**, then nurture them with an
automated 3-step drip (Day 0 / 2 / 5) over **email + WhatsApp + Messenger/IG DM**.

Built with **Next.js 15 + TypeScript + Prisma + Resend + Meta Graph/WhatsApp Cloud API.**

```
Visitor / Lead Ad / WhatsApp  ─▶  Lead saved  ─▶  Welcome (Day 0)
   ─▶  Value (Day 2)  ─▶  Offer (Day 5)  ─▶  opens/clicks tracked  ─▶  Dashboard
```

## Run it locally (5 commands)

```bash
npm install
cp .env.example .env          # then fill in RESEND_API_KEY + EMAIL_FROM
npx prisma db push            # create the SQLite database
npm run db:seed               # optional: a few demo leads
npm run dev                   # http://localhost:3000
```

- Landing page + form: **http://localhost:3000**
- Dashboard: **http://localhost:3000/dashboard?key=YOUR_ADMIN_KEY**
- Test the emails: **http://localhost:3000/api/test-send?key=YOUR_ADMIN_KEY&to=you@email.com**

> Email needs a real Resend key + verified `EMAIL_FROM` to actually send.
> WhatsApp/Meta need the Meta env vars (see below); without them, leads still
> save and the welcome send is skipped gracefully.

## Project map

| Path | What it does |
|------|--------------|
| `app/page.tsx` + `components/LeadForm.tsx` | Landing page + capture form |
| `app/api/leads/route.ts` | Web form → save lead → welcome |
| `app/api/webhooks/meta/route.ts` | **One** webhook for FB/IG Lead Ads, WhatsApp, Messenger/IG DMs |
| `app/api/cron/drip/route.ts` | Daily drip (Day 2 + Day 5) on each lead's channel |
| `app/api/track/{open,click}/route.ts` | Email open + click tracking |
| `app/api/unsubscribe/route.ts` | One-click unsubscribe |
| `app/api/test-send/route.ts` | Send all templates to yourself |
| `app/dashboard/page.tsx` | Metrics + lead list by channel |
| `lib/content.ts` | ✏️ **Your campaign copy** (edit this) |
| `lib/email.ts` / `lib/whatsapp.ts` / `lib/meta.ts` | Channel senders |
| `lib/messaging.ts` | Routes a step to the right channel |
| `prisma/schema.prisma` | `Lead` + `Event` data model |

## Connecting Meta (Facebook / Instagram / WhatsApp)

All four channels share **one Meta app** and **one webhook**:
`https://YOUR_APP/api/webhooks/meta`

1. **Meta app** → create at [developers.facebook.com](https://developers.facebook.com).
2. **Webhook** → set the callback URL above + your `META_VERIFY_TOKEN`; subscribe to
   `leadgen`, `messages`, `messaging_postbacks`.
3. **Lead Ads** → connect your Page; add `META_PAGE_ACCESS_TOKEN` so the app can
   fetch submitted leads.
4. **WhatsApp** → add `WHATSAPP_TOKEN` + `WHATSAPP_PHONE_NUMBER_ID`, and create
   approved message templates named `lead_welcome` / `lead_value` / `lead_offer`
   (each with one body parameter `{{1}}` = name).
5. **Messenger/IG DMs** → covered by the same Page token + webhook.

> ⚠️ WhatsApp/Messenger/IG can only **start** a conversation with an approved
> template (WhatsApp) or inside the 24-hour window (DMs). The code handles both.

## Deploy to production (Vercel)

```bash
npm i -g vercel
vercel            # link the project
vercel --prod     # deploy
```

Then in the Vercel dashboard:
1. Switch `prisma/schema.prisma` `provider` to `postgresql` and set `DATABASE_URL`
   to a hosted Postgres (e.g. [Neon](https://neon.tech) / [Supabase](https://supabase.com)).
2. Add every variable from `.env.example` under **Settings → Environment Variables**
   (set `APP_URL` to your real domain).
3. The drip runs automatically via `vercel.json` cron (daily 14:00 UTC); Vercel
   sends the `CRON_SECRET` for you.
4. For email deliverability, add **SPF / DKIM / DMARC** DNS records from Resend.

## License

Free to use, fork, edit, and ship.
