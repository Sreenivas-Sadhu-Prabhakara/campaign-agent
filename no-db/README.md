# No-database, no-cost variant

The simplest possible version of the lead app: **no database, no server, no bill.**

- **Storage** → a Google Sheet (the Sheet *is* the database)
- **Backend** → Google Apps Script (runs free on Google's servers)
- **Email** → Gmail (`MailApp`, free — ~100 sends/day on consumer Gmail)
- **Landing page** → one static `index.html` (host free on GitHub Pages)

It does the core job end-to-end: capture a lead → instant welcome email →
auto follow-ups on Day 2 and Day 5 → one-click unsubscribe → every lead in a
spreadsheet you already know how to use. Total cost: **$0.**

```
index.html (form)  ──POST──▶  Apps Script  ──▶  Google Sheet (storage)
                                   │
                                   ├─▶ welcome email (instant)
                                   └─▶ daily trigger → Day 2 / Day 5 emails
```

## Setup (about 10 minutes, all free)

1. **Create a Google Sheet** at [sheets.new](https://sheets.new). Name it anything.
2. **Open the script editor:** in the Sheet, **Extensions → Apps Script**.
3. **Paste the code:** delete the sample, paste all of [`Code.gs`](./Code.gs).
   Edit the **CONFIG** block at the top (`OWNER_EMAIL`, `COMPANY`,
   `COMPANY_ADDRESS`, `OFFER_URL`) and the **COPY** block (your 3 emails).
4. **Authorize + schedule:** from the function dropdown pick
   **`installDailyTrigger`** → **Run**. Approve the permissions prompt once.
   This creates the `Leads` sheet and schedules the daily drip.
5. **Deploy as a Web App:** **Deploy → New deployment → type: Web app**.
   - *Execute as:* **Me**
   - *Who has access:* **Anyone**
   - Click **Deploy** and **copy the Web app URL** (it ends in `/exec`).
6. **Wire up the page:** open [`index.html`](./index.html) and paste that URL into
   `const WEBAPP_URL = "…"` near the bottom.
7. **Publish the page (free):** drop `index.html` on
   [GitHub Pages](https://pages.github.com), Netlify Drop, or just open it
   locally to test.

## Test it

- Open `index.html`, submit your own email.
- You should get a **welcome email** within seconds, an **alert email** to
  `OWNER_EMAIL`, and a new **row in the Sheet**.
- To preview the drip without waiting days, temporarily set
  `DRIP_DAYS = { value: 0, offer: 0 }` and run `sendDrip` manually.

## How it stores data

The `Leads` sheet has six columns the script manages for you:

| Timestamp | Name | Email | Source | LastStep | Status |
|-----------|------|-------|--------|----------|--------|

`LastStep` advances `welcome → value → offer`; `Status` flips to
`unsubscribed` when someone clicks the footer link. That's the whole "database."

## Limits & when to graduate

- **Gmail sending quota:** ~100 recipients/day (consumer) or ~1,500
  (Workspace). Fine for early lead gen.
- **No open/click tracking, no WhatsApp/Meta channels.** When you need those,
  or you're sending thousands of emails, move up to the full app in
  [`../starter`](../starter) — still deployable on free tiers.

## Want WhatsApp/Facebook/Instagram too?

That's the [`../starter`](../starter) app (Next.js + free Vercel/Neon tiers).
This `no-db` variant is the frugal email-only on-ramp.
