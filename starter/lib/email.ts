// Email channel: builds a responsive HTML email with open/click tracking +
// unsubscribe footer, and sends it via Resend.
import { Resend } from "resend";
import { COPY, type Step } from "./content";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";
const COMPANY = process.env.COMPANY_NAME || "Your Company";
const ADDR = process.env.COMPANY_ADDRESS || "123 Example Street, Your City, 00000";
const base = () => (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");

interface EmailLead {
  id: string;
  name: string | null;
  email: string;
}

// Wrap an outbound link so clicks are tracked then redirected.
function trackedLink(href: string, leadId: string, step: Step) {
  return `${base()}/api/track/click?lead=${leadId}&e=${step}&url=${encodeURIComponent(href)}`;
}

function renderHtml(lead: EmailLead, step: Step) {
  const c = COPY[step];
  const unsub = `${base()}/api/unsubscribe?lead=${lead.id}`;
  const pixel = `${base()}/api/track/open?lead=${lead.id}&e=${step}`;
  const body = c.paragraphs(lead).map((p) => `<p style="margin:0 0 16px">${p}</p>`).join("");
  const button = `<a href="${trackedLink(c.cta.url, lead.id, step)}"
      style="display:inline-block;background:#bf4324;color:#ffffff;text-decoration:none;
             padding:13px 24px;border-radius:8px;font-weight:bold;font-size:15px">${c.cta.label}</a>`;

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f6f1e7;font-family:Arial,Helvetica,sans-serif;color:#211b13">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td align="center" style="padding:32px 16px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="max-width:520px;background:#ffffff;border-radius:14px;border:1px solid #e2d8c2;overflow:hidden">
        <tr><td style="padding:32px 28px;font-size:16px;line-height:1.6">
          ${body}
          <div style="margin:26px 0 6px">${button}</div>
        </td></tr>
        <tr><td style="padding:18px 28px;background:#f3ecdd;font-size:12px;color:#8a7d63;line-height:1.5">
          ${COMPANY} · ${ADDR}<br/>
          You're receiving this because you signed up.
          <a href="${unsub}" style="color:#8a7d63">Unsubscribe</a>.
        </td></tr>
      </table>
    </td>
  </tr></table>
  <img src="${pixel}" width="1" height="1" alt="" style="display:none"/>
</body></html>`;
}

export async function sendEmail(lead: EmailLead, step: Step) {
  const html = renderHtml(lead, step);
  await resend.emails.send({
    from: FROM,
    to: lead.email,
    subject: COPY[step].subject(lead),
    html,
  });
}
