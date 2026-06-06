# The Lead Engine — Multi-Channel Lead-Gen Campaign App + Build Guide

The **exact, optimal, ready-to-run** way to build a custom lead-generation
campaign app across **email, WhatsApp, Facebook, and Instagram** — with
copy-paste commands and AI prompts for Claude, Codex/ChatGPT, Gemini & Copilot.

This repo has two parts:

| Part | Path | What it is |
|------|------|-----------|
| 📖 **The guide** | [`index.html`](./index.html) | A polished, copy-paste field guide (hosted on GitHub Pages) |
| 🛠 **The app** | [`starter/`](./starter) | The actual runnable app — **build-verified** |

**Live guide:** https://sreenivas-sadhu-prabhakara.github.io/campaign-agent/

## What the app does

```
CAPTURE                         NURTURE (auto)            MEASURE
Website form ──┐
Facebook Lead Ad ──┤            Day 0  Welcome
Instagram Lead Ad ─┼─▶ Lead ──▶ Day 2  Value     ──▶ opens · clicks
WhatsApp message ──┤   (DB)     Day 5  Offer          replies · status
Messenger / IG DM ─┘            routed per channel    ──▶ Dashboard
```

- One web form (email and/or WhatsApp) with honeypot spam protection
- **One Meta webhook** for FB/IG Lead Ads, WhatsApp, and Messenger/IG DMs
- Channel-aware drip (sends each step on the lead's own channel, never double-sends)
- Email open/click tracking, one-click unsubscribe, and a dashboard with per-channel metrics
- All campaign copy in a single file (`starter/lib/content.ts`)

Tech: **Next.js 15 · TypeScript · Prisma · Resend · Meta Graph + WhatsApp Cloud API · Vercel.**

## Run the app (5 commands)

```bash
cd starter
npm install
cp .env.example .env        # add RESEND_API_KEY + EMAIL_FROM
npx prisma db push
npm run dev                 # http://localhost:3000
```

Full instructions, the Meta setup, and deployment are in [`starter/README.md`](./starter/README.md)
and on the [live guide](https://sreenivas-sadhu-prabhakara.github.io/campaign-agent/).

## Update the hosted guide

Edit `index.html`, then:

```bash
git add -A && git commit -m "Update guide" && git push
```

GitHub Pages redeploys automatically in ~1 minute.

## License

Free to use, fork, edit, and ship.
