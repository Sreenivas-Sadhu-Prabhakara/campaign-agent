/**
 * The Lead Engine — no-database, no-cost variant
 * =================================================
 * Google Apps Script backend. The Google Sheet IS the database.
 * Gmail sends the emails. Everything runs free on Google's infrastructure.
 *
 * SETUP (see README.md): create a Sheet → Extensions → Apps Script →
 * paste this file → run `installDailyTrigger` once → Deploy as Web App
 * ("Execute as: Me", "Who has access: Anyone") → copy the /exec URL into
 * no-db/index.html (WEBAPP_URL).
 */

// ============================ CONFIG ============================
const OWNER_EMAIL = "you@example.com";          // new-lead alerts go here
const COMPANY = "Your Company";
const COMPANY_ADDRESS = "123 Example Street, Your City, 00000"; // legally required in emails
const OFFER_URL = "https://your-site.com/guide"; // your lead magnet / booking page
const SHEET_NAME = "Leads";

// ============================ CAMPAIGN COPY ============================
// Edit these three steps for your business. {{name}} is replaced automatically.
const COPY = {
  welcome: {
    subject: "Welcome — your guide is inside",
    lines: [
      "Hi {{name}}, thanks for signing up!",
      "Here's the guide you asked for. Over the next few days I'll share a couple of quick, practical wins.",
      "Just reply to this email any time — I read every one.",
    ],
    cta: "Read the guide",
  },
  value: {
    subject: "One quick win you can use today",
    lines: [
      "Hey {{name}} — a fast tip while it's fresh.",
      "The biggest lever most people miss is following up. A simple 3-message sequence typically lifts replies 2–3x versus a single touch.",
      "Want a hand setting it up? Tap below.",
    ],
    cta: "Show me how",
  },
  offer: {
    subject: "Ready to get started? (time-sensitive)",
    lines: [
      "Hi {{name}}, I'll keep this short.",
      "If now's the right time, here's a simple next step. This offer is open for the next few days.",
      "One click and you're in 👇",
    ],
    cta: "Claim my spot",
  },
};

// Drip timing: value at Day 2, offer at Day 5 (welcome is sent instantly).
const DRIP_DAYS = { value: 2, offer: 5 };

// ============================ WEB ENDPOINTS ============================

// Form submissions POST here.
function doPost(e) {
  try {
    const data = parseBody(e);
    if (data.website) return json({ ok: true }); // honeypot: bots fill this

    const email = String(data.email || "").trim().toLowerCase();
    const name = String(data.name || "").trim();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json({ ok: false, error: "Please enter a valid email." });
    }

    const sheet = getSheet();
    if (findRow(sheet, email) === -1) {
      sheet.appendRow([new Date(), name, email, data.source || "website", "welcome", "active"]);
      sendStep(name, email, "welcome");
      MailApp.sendEmail(OWNER_EMAIL, "🎯 New lead: " + (name || email),
        (name || "(no name)") + " <" + email + ">\nSource: " + (data.source || "website"));
    }
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

// Unsubscribe links point here:  ...exec?unsub=email@example.com
function doGet(e) {
  if (e.parameter && e.parameter.unsub) {
    const sheet = getSheet();
    const row = findRow(sheet, String(e.parameter.unsub).toLowerCase());
    if (row !== -1) sheet.getRange(row, 6).setValue("unsubscribed"); // col F = Status
    return HtmlService.createHtmlOutput(
      "<div style='font-family:system-ui;text-align:center;padding:64px;color:#1c1a17'>" +
      "<h1>You're unsubscribed</h1><p>You won't receive any more messages.</p></div>"
    );
  }
  return ContentService.createTextOutput("The Lead Engine is running.");
}

// ============================ DRIP (daily trigger) ============================

// Runs once a day (installDailyTrigger). Sends value@Day2 and offer@Day5.
function sendDrip() {
  const sheet = getSheet();
  const rows = sheet.getDataRange().getValues();
  const now = new Date();
  for (let i = 1; i < rows.length; i++) {
    const [ts, name, email, , lastStep, status] = rows[i];
    if (!email || status === "unsubscribed") continue;
    const ageDays = (now - new Date(ts)) / 86400000;

    let next = null;
    if (lastStep === "welcome" && ageDays >= DRIP_DAYS.value) next = "value";
    else if (lastStep === "value" && ageDays >= DRIP_DAYS.offer) next = "offer";

    if (next) {
      sendStep(name, email, next);
      sheet.getRange(i + 1, 5).setValue(next); // col E = LastStep
    }
  }
}

// Run this ONCE from the editor to schedule the daily drip.
function installDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "sendDrip") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("sendDrip").timeBased().everyDays(1).atHour(9).create();
  getSheet(); // also ensures the Leads sheet + header exist
}

// ============================ HELPERS ============================

function sendStep(name, email, key) {
  const c = COPY[key];
  const unsubUrl = ScriptApp.getService().getUrl() + "?unsub=" + encodeURIComponent(email);
  const body = c.lines.map(function (l) {
    return "<p style='margin:0 0 16px'>" + l.replace("{{name}}", name || "there") + "</p>";
  }).join("");
  const html =
    "<div style='font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#1c1a17'>" +
    "<div style='background:#fff;border:1px solid #e2d8c2;border-radius:14px;padding:28px'>" +
    body +
    "<p style='margin:24px 0 0'><a href='" + OFFER_URL + "' style='background:#c2410c;color:#fff;" +
    "text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:bold'>" + c.cta + "</a></p>" +
    "</div>" +
    "<p style='font-size:12px;color:#8c857b;text-align:center;margin-top:14px'>" +
    COMPANY + " · " + COMPANY_ADDRESS + "<br>" +
    "<a href='" + unsubUrl + "' style='color:#8c857b'>Unsubscribe</a></p></div>";

  MailApp.sendEmail({
    to: email,
    subject: c.subject,
    htmlBody: html,
    name: COMPANY,
  });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(["Timestamp", "Name", "Email", "Source", "LastStep", "Status"]);
  }
  return sh;
}

function findRow(sheet, email) {
  const col = sheet.getRange(2, 3, Math.max(sheet.getLastRow() - 1, 0), 1).getValues();
  for (let i = 0; i < col.length; i++) {
    if (String(col[i][0]).toLowerCase() === email) return i + 2; // 1-based + header
  }
  return -1;
}

function parseBody(e) {
  if (e && e.postData && e.postData.contents) {
    try { return JSON.parse(e.postData.contents); } catch (_) {}
  }
  return (e && e.parameter) || {};
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
