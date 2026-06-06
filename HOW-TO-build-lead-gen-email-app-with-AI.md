# How to Build a Custom Lead-Generation Email Campaign App Using AI Coding Assistants

A practical, copy-paste-friendly guide to building a custom email campaign app — one that helps you capture, nurture, and convert more leads — using four AI assistants:

- **Claude** (Claude Code CLI / Claude.ai / Claude API)
- **OpenAI Codex / ChatGPT** (Codex CLI / ChatGPT with GPT-5)
- **Google Gemini** (Gemini CLI / Gemini in AI Studio)
- **Microsoft Copilot** (GitHub Copilot / Microsoft 365 Copilot)

You don't need all four. This guide shows what each is best at so you can pick one as your "driver" and use the others as a second opinion or for specific strengths.

---

## Table of Contents

1. [What you're building](#1-what-youre-building)
2. [Choose your AI assistant](#2-choose-your-ai-assistant-quick-comparison)
3. [Prerequisites](#3-prerequisites)
4. [The reusable master prompt](#4-the-reusable-master-prompt)
5. [Step-by-step with Claude](#5-step-by-step-with-claude)
6. [Step-by-step with OpenAI Codex / ChatGPT](#6-step-by-step-with-openai-codex--chatgpt)
7. [Step-by-step with Google Gemini](#7-step-by-step-with-google-gemini)
8. [Step-by-step with Microsoft Copilot](#8-step-by-step-with-microsoft-copilot)
9. [The app blueprint (what the AI will build)](#9-the-app-blueprint-what-the-ai-will-build)
10. [Writing the campaign emails with AI](#10-writing-the-campaign-emails-with-ai)
11. [Compliance, deliverability & testing](#11-compliance-deliverability--testing)
12. [Launch checklist](#12-launch-checklist)
13. [Prompt library (copy/paste)](#13-prompt-library-copypaste)

---

## 1. What you're building

A lightweight web app that runs lead-generation email campaigns. Core features:

| Feature | Why it drives leads |
|---|---|
| **Landing page + signup form** | Captures email addresses (the lead) |
| **Lead database** | Stores contacts, source, tags, and status |
| **Email composer with templates** | Send welcome / nurture / offer sequences |
| **Drip / sequence automation** | Auto-follow-up turns cold signups into warm leads |
| **Personalization (merge tags)** | Higher open/click rates = more conversions |
| **Tracking (opens, clicks, conversions)** | Know what works, double down |
| **Simple dashboard** | See lead count, conversion rate, best-performing email |

**Recommended starter tech stack** (easy for any AI to generate and for you to deploy):

- **Frontend:** Next.js (React) + Tailwind CSS
- **Backend/API:** Next.js API routes (or a small Node/Express server)
- **Database:** SQLite for local dev → Postgres (Supabase/Neon) for production
- **Email sending:** [Resend](https://resend.com), SendGrid, Amazon SES, or Postmark (all have generous free tiers and simple APIs)
- **Hosting:** Vercel (one-click for Next.js) or Netlify

> Swap any layer if you prefer — the AI assistants handle Python/Flask, Rails, or plain HTML+PHP equally well. Just say so in the prompt.

---

## 2. Choose your AI assistant (quick comparison)

| Assistant | Best for | Where it runs | Cost (typical) |
|---|---|---|---|
| **Claude (Claude Code)** | End-to-end app building in your terminal; reads/writes whole projects, runs commands, fixes its own errors | CLI, VS Code/JetBrains extension, web | Pro/Max subscription or API |
| **ChatGPT + Codex** | Strong reasoning + a cloud/CLI agent that can edit code and open PRs | ChatGPT app, Codex CLI, IDE extension | Plus/Pro subscription or API |
| **Google Gemini (CLI)** | Free, large context window, good at multimodal (paste a screenshot of a design) | Gemini CLI, AI Studio, web | Generous free tier |
| **Microsoft Copilot** | In-editor autocomplete + chat (GitHub Copilot); plus drafting copy in Word/Outlook (M365 Copilot) | VS Code, Visual Studio, GitHub, M365 apps | Copilot subscription |

**Rule of thumb:**
- Want the AI to **build the whole app for you, file by file, and run it** → use **Claude Code** or **Codex CLI**.
- Want **autocomplete while you code** → use **GitHub Copilot**.
- Want **free + big context** → use **Gemini CLI**.
- Want help **writing the marketing emails and managing in Outlook/Word** → use **Microsoft 365 Copilot** alongside any of the above.

---

## 3. Prerequisites

Install these once (the AI can walk you through each if you get stuck):

1. **Node.js** (LTS) — https://nodejs.org
2. **Git** — https://git-scm.com
3. A code editor — **VS Code** is the most universally supported by these tools.
4. An **email-sending API key** — sign up for Resend/SendGrid/SES and get an API key.
5. A **domain** (for production sending + deliverability) — you'll add SPF/DKIM/DMARC DNS records later.

Then set up a project folder:

```bash
mkdir lead-campaign-app && cd lead-campaign-app
git init
```

---

## 4. The reusable master prompt

This single prompt works (with tiny tweaks) in **all four** tools. Paste it as your first message. Keep it in a file so you can reuse it.

```
You are my senior full-stack engineer. Build a custom email-campaign web app
whose goal is to capture and convert more sales leads.

TECH STACK
- Next.js (App Router) + TypeScript + Tailwind CSS
- SQLite via Prisma for local dev (make it easy to switch to Postgres later)
- Resend for sending email (read RESEND_API_KEY from .env)

FEATURES (build incrementally, smallest working version first)
1. Public landing page with a value proposition headline and an email
   capture form (name + email). On submit, save the lead and send a
   welcome email.
2. A "leads" table: id, name, email, source, tags, status
   (new | engaged | converted | unsubscribed), createdAt.
3. Admin dashboard (simple password-protected) showing total leads,
   new this week, conversion rate, and a list of leads.
4. Email templates stored as React/HTML with merge tags ({{name}}).
5. A drip sequence: Day 0 welcome, Day 2 value email, Day 5 offer email.
   Implement as a scheduled job / cron-friendly endpoint.
6. Open & click tracking (tracking pixel + redirect links) and an
   unsubscribe link in every email.

CONSTRAINTS
- Mobile-responsive, accessible, clean modern UI.
- Include input validation and basic spam protection (honeypot field).
- Add a .env.example, a README with run instructions, and seed data.
- Follow email compliance: physical address + unsubscribe in footer.

PROCESS
- Propose the file/folder structure first and wait for my "go".
- Then implement step 1 end-to-end and tell me how to run it before
  moving on. Explain key decisions briefly.
```

> **Tip:** If you want a non-technical / no-code path, replace the stack line with: *"Build this as a single self-contained HTML file with embedded JS that posts to a Google Sheet / Airtable, so I can host it anywhere."* Every tool can do this too.

---

## 5. Step-by-step with Claude

Claude is strongest at **building and running the whole project** for you.

### Option A — Claude Code (recommended, terminal)

1. **Install:**
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```
2. **Start it in your project folder:**
   ```bash
   cd lead-campaign-app
   claude
   ```
3. **Paste the [master prompt](#4-the-reusable-master-prompt).** Claude will propose a file structure. Type `go`.
4. **Let it build.** Claude writes files, installs dependencies, and can run the dev server. Approve commands when prompted (or use a permissive mode).
5. **Iterate by talking to it:**
   - `Add A/B testing for subject lines and show open-rate per variant.`
   - `The welcome email looks plain — make it match this brand color #1a73e8 and add a CTA button.`
   - `Write tests for the lead-capture API and run them.`
6. **Ask it to verify:** `Run the app, open the landing page, submit a test lead, and confirm the welcome email is queued.`
7. **Deploy:** `Set this up to deploy to Vercel and walk me through connecting Postgres.`

### Option B — Claude.ai (browser, no install)

1. Go to https://claude.ai and start a project.
2. Paste the master prompt. Claude returns complete code files.
3. Copy each file into your editor (or use the "Artifacts" panel to preview a runnable single-file version).
4. Use **Claude Artifacts** to get an instant live preview of the landing page before you wire up the backend.

### Option C — Claude API (if you want the app itself to use AI)

Use the Claude API inside your app to **auto-generate personalized email copy per lead** (e.g., based on their signup source). Ask Claude Code: *"Add an endpoint that calls the Claude API to draft a personalized follow-up email from the lead's name and source, with prompt caching enabled."*

---

## 6. Step-by-step with OpenAI Codex / ChatGPT

OpenAI gives you two complementary tools.

### Option A — Codex CLI (agentic, terminal — closest to Claude Code)

1. **Install:**
   ```bash
   npm install -g @openai/codex
   ```
   (Or `brew install codex` on macOS.)
2. **Sign in** with your ChatGPT account or an API key.
3. **Run in your project:**
   ```bash
   cd lead-campaign-app
   codex
   ```
4. **Paste the master prompt.** Codex plans, writes files, and runs commands. Approve actions as it goes.
5. **Iterate** the same way as Claude: ask for features, fixes, and tests in plain English.
6. **PR workflow:** Codex can also run in the cloud from chatgpt.com/codex — point it at a GitHub repo and ask it to "open a pull request that adds click-tracking." Review the PR before merging.

### Option B — ChatGPT (browser, GPT-5)

1. Go to https://chatgpt.com.
2. Paste the master prompt. ChatGPT returns the code, file by file.
3. Use **Canvas** to edit code side-by-side and iterate.
4. Great for **architecture discussions** ("Should I use a cron job or a queue for the drip sequence? Compare trade-offs") and **debugging** (paste your error, get a fix).

> **Combo move:** Plan the architecture in ChatGPT, then hand the plan to Codex CLI to implement.

---

## 7. Step-by-step with Google Gemini

Gemini's edge: **free tier, very large context window**, and **multimodal** (you can paste a screenshot of a design you like).

### Option A — Gemini CLI (agentic, terminal)

1. **Install:**
   ```bash
   npm install -g @google/gemini-cli
   ```
2. **Run and authenticate** (sign in with your Google account for the free tier):
   ```bash
   cd lead-campaign-app
   gemini
   ```
3. **Paste the master prompt.** Gemini scaffolds the project, edits files, and runs commands.
4. **Use its big context:** point it at the whole repo and ask sweeping changes — *"Audit every email template for unsubscribe links and add any that are missing."*
5. **Use multimodal input:** drop in a screenshot — *"Make my landing page look like this reference image"* — and Gemini will match the layout.

### Option B — Google AI Studio (browser)

1. Go to https://aistudio.google.com.
2. Paste the master prompt; iterate in the chat.
3. Use the **"Build" / app prototyping** features to get a runnable preview, then export the code.

---

## 8. Step-by-step with Microsoft Copilot

"Copilot" is two products — use both for different jobs.

### Option A — GitHub Copilot (in your code editor)

Best as an **in-editor pair programmer** rather than a from-scratch app builder.

1. **Install** the *GitHub Copilot* + *GitHub Copilot Chat* extensions in **VS Code** (or use Visual Studio).
2. **Open Copilot Chat** (the chat icon in the sidebar) and use **Agent mode** for multi-file tasks.
3. **Paste the master prompt** into Agent mode — it can create files and run terminal commands, similar to the CLIs above.
4. **Inline autocomplete:** as you type, Copilot suggests code. Write a comment describing what you want and press Tab:
   ```ts
   // POST /api/leads — validate email, save lead to db, send welcome email via Resend
   ```
5. **Use slash commands** in chat: `/tests` to generate tests, `/fix` to repair the selected code, `/explain` to understand a file.

### Option B — Microsoft 365 Copilot (for the campaign content & ops)

This is where Microsoft shines for a **lead campaign** specifically:

- **Outlook Copilot:** draft, refine, and personalize the campaign emails; "summarize replies from leads this week."
- **Word Copilot:** write the long-form lead magnet (ebook/guide) you offer in exchange for the email.
- **Excel Copilot:** analyze your exported leads CSV — *"Show conversion rate by source and chart the top 5."*
- **Copilot Studio:** build a no-code chatbot/agent on your site to capture leads conversationally.

> **Practical split:** Build the *app* with GitHub Copilot (or Claude/Codex/Gemini), and write the *emails + analyze results* with M365 Copilot.

---

## 9. The app blueprint (what the AI will build)

Use this to sanity-check whatever the AI generates.

```
lead-campaign-app/
├─ app/
│  ├─ page.tsx                 # Landing page + capture form
│  ├─ api/
│  │  ├─ leads/route.ts        # POST: create lead, send welcome
│  │  ├─ track/open/route.ts   # GET: tracking pixel
│  │  ├─ track/click/route.ts  # GET: click redirect + log
│  │  ├─ unsubscribe/route.ts  # GET: one-click unsubscribe
│  │  └─ cron/drip/route.ts    # Scheduled: send next drip email
│  └─ dashboard/page.tsx       # Admin metrics + lead list
├─ emails/
│  ├─ welcome.tsx              # Day 0
│  ├─ value.tsx                # Day 2
│  └─ offer.tsx                # Day 5
├─ lib/
│  ├─ db.ts                    # Prisma client
│  ├─ mailer.ts                # Resend wrapper + merge tags
│  └─ tracking.ts             # pixel + link helpers
├─ prisma/schema.prisma        # Lead, EmailEvent models
├─ .env.example
└─ README.md
```

**Data model (minimum):**

```prisma
model Lead {
  id        String   @id @default(cuid())
  name      String?
  email     String   @unique
  source    String?  // e.g. "facebook-ad", "homepage"
  tags      String?  // comma-separated
  status    String   @default("new") // new|engaged|converted|unsubscribed
  createdAt DateTime @default(now())
  events    EmailEvent[]
}

model EmailEvent {
  id        String   @id @default(cuid())
  leadId    String
  lead      Lead     @relation(fields: [leadId], references: [id])
  type      String   // sent|opened|clicked|converted
  emailKey  String   // welcome|value|offer
  createdAt DateTime @default(now())
}
```

The lead-conversion loop:

```
Visitor → Landing page → Submit form → Lead saved (status: new)
   → Welcome email (Day 0) → opens/clicks tracked (status: engaged)
   → Value email (Day 2) → Offer email (Day 5)
   → Clicks offer / books call → status: converted → notify you
```

---

## 10. Writing the campaign emails with AI

A great app sends mediocre results without great copy. Use any assistant (M365 Copilot, ChatGPT, Claude, and Gemini are all strong writers) with this prompt:

```
Write a 3-email lead-nurture sequence for [YOUR PRODUCT/SERVICE].
Audience: [who they are and their main pain point].
Goal: get them to [book a demo / start a free trial / reply].
Tone: helpful, concise, no hype.

Email 1 (Day 0, Welcome): thank them, set expectations, deliver the
  lead magnet, one soft CTA.
Email 2 (Day 2, Value): teach one useful tip that builds trust, light CTA.
Email 3 (Day 5, Offer): make a clear, time-bound offer with a single CTA.

For each: give 3 subject-line options, preview text, and body with a
{{name}} merge tag. Keep each under 150 words. Plain, scannable formatting.
```

**High-converting email tips to tell the AI:**
- One clear call-to-action per email.
- Subject lines: short, specific, curiosity or benefit — A/B test two.
- Personalize beyond the name (reference their `source`).
- Mobile-first: short paragraphs, big tappable button.
- Always include unsubscribe + your physical address.

---

## 11. Compliance, deliverability & testing

Ask your AI to bake these in — they protect your sender reputation and keep you legal.

**Legal (CAN-SPAM / GDPR / CASL):**
- ✅ Clear, working **unsubscribe** link in every email (honor within 10 days).
- ✅ A real **physical mailing address** in the footer.
- ✅ No deceptive subject lines or "from" names.
- ✅ For EU/Canada contacts: get **consent** (opt-in) before emailing; record it.

**Deliverability (so emails reach the inbox, not spam):**
- Set up **SPF, DKIM, and DMARC** DNS records for your sending domain (your email provider gives you the exact records). Prompt: *"Walk me through adding SPF/DKIM/DMARC for Resend on my domain."*
- Warm up a new domain gradually; don't blast 10,000 emails on day one.
- Keep lists clean — remove hard bounces and unsubscribes automatically.

**Testing before launch:**
- Send test emails to yourself across Gmail, Outlook, and mobile.
- Use **mail-tester.com** to score spamminess.
- Verify tracking pixels and unsubscribe actually fire (check the dashboard).

Prompt: *"Add a /api/test-send endpoint that sends each template to my address with sample merge data, and a script to run it."*

---

## 12. Launch checklist

- [ ] Landing page live and mobile-responsive
- [ ] Form saves leads + sends welcome email
- [ ] All 3 drip emails written, tested, and scheduled
- [ ] Open/click/unsubscribe tracking verified
- [ ] SPF/DKIM/DMARC configured; mail-tester score 9+/10
- [ ] Unsubscribe + physical address in every footer
- [ ] Dashboard shows leads + conversion rate
- [ ] Environment variables set in production (no secrets in code)
- [ ] Deployed (Vercel/Netlify) with production database
- [ ] A small test cohort sent before the full list

---

## 13. Prompt library (copy/paste)

**Scaffold the project**
> Use the [master prompt](#4-the-reusable-master-prompt) above.

**Add a feature**
```
Add subject-line A/B testing: send variant A to half of new leads and
variant B to the other half, record opens per variant, and show the
winner on the dashboard. Implement, then run the app and confirm it works.
```

**Improve the UI**
```
Redesign the landing page to maximize signups: strong above-the-fold
headline, social proof, a single email field with one clear CTA button,
and a trust line about no spam. Keep it fast and accessible.
```

**Debug**
```
Here's the error when I submit the form: [paste error + stack trace].
Find the root cause, fix it, and add a test that would have caught it.
```

**Analyze results (M365 Copilot in Excel / any AI on a CSV)**
```
Here is my leads export [paste/attach CSV]. Calculate conversion rate by
source, identify the best-performing subject line, and suggest 3 changes
to increase conversions next week.
```

**Generate the lead magnet**
```
Write a concise, genuinely useful 5-page guide titled "[topic]" that my
target audience would trade their email for. Include a one-line hook I
can put on the landing page.
```

---

### Quick recommendation

If you just want to get moving: **install Claude Code (or Codex CLI), paste the master prompt, and let it build the app while you use M365 Copilot or ChatGPT to write the emails.** Then run the [launch checklist](#12-launch-checklist) before sending to real leads.

Good luck — start small (landing page + welcome email), get one real lead through the full loop, then expand.
