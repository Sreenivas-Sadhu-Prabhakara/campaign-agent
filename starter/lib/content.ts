// Single source of truth for campaign copy.
// Each step has copy that works for BOTH email (subject + paragraphs + CTA)
// and chat channels (a short plain-text version for WhatsApp / Messenger / IG).
//
// 👉 This is the file to edit (or have an AI rewrite) for your own offer.

export const STEPS = ["welcome", "value", "offer"] as const;
export type Step = (typeof STEPS)[number];

export interface LeadLike {
  name: string | null;
}

const OFFER_URL = process.env.OFFER_URL || process.env.APP_URL || "http://localhost:3000";
const firstName = (l: LeadLike) => (l.name ? l.name.split(" ")[0] : "there");

export interface StepCopy {
  subject: (l: LeadLike) => string; // email subject line
  paragraphs: (l: LeadLike) => string[]; // email body paragraphs
  cta: { label: string; url: string }; // single call-to-action
  text: (l: LeadLike) => string; // WhatsApp / DM plain-text version
}

export const COPY: Record<Step, StepCopy> = {
  welcome: {
    subject: (l) => `Welcome${l.name ? `, ${firstName(l)}` : ""} — your guide is inside`,
    paragraphs: (l) => [
      `Hi ${firstName(l)}, thanks for signing up!`,
      `Here's the guide you asked for. Over the next few days I'll share a couple of quick, practical wins to help you get results — no fluff.`,
      `Hit reply any time with a question. I read every message.`,
    ],
    cta: { label: "Read the guide", url: OFFER_URL },
    text: (l) =>
      `Hi ${firstName(l)} 👋 Thanks for signing up! Here's your guide: ${OFFER_URL}\n\nOver the next few days I'll send a couple of quick wins. Reply any time.`,
  },
  value: {
    subject: () => `One quick win you can use today`,
    paragraphs: (l) => [
      `Hey ${firstName(l)} — a fast tip while it's fresh.`,
      `The single biggest lever most people miss: follow up. A simple 3-message sequence typically lifts replies 2–3x versus a single touch. (That's exactly what this app does for you.)`,
      `Want me to walk you through setting it up? Tap below.`,
    ],
    cta: { label: "Show me how", url: OFFER_URL },
    text: (l) =>
      `Quick tip, ${firstName(l)}: following up 3x typically lifts replies 2–3x vs a single message. Want a walkthrough? ${OFFER_URL}`,
  },
  offer: {
    subject: (l) => `${firstName(l)}, ready to get started? (time-sensitive)`,
    paragraphs: (l) => [
      `Hi ${firstName(l)}, I'll keep this short.`,
      `If now's the right time, here's a simple next step. This offer is open for the next few days.`,
      `One click and you're in 👇`,
    ],
    cta: { label: "Claim my spot", url: OFFER_URL },
    text: (l) =>
      `${firstName(l)}, ready to start? Here's your next step (open a few more days): ${OFFER_URL}`,
  },
};
