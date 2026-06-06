# The Lead Engine — AI Email Campaign Field Guide

A single-page, copy-paste field guide for building a **custom lead-generation email campaign app** using **Claude, OpenAI Codex/ChatGPT, Google Gemini, and Microsoft Copilot**.

It's a self-contained `index.html` (no build step, no dependencies) designed to be hosted on **GitHub Pages**.

## Features

- 📋 **20+ copyable prompts** — every code/prompt block has a one-click copy button
- 🧭 **Sticky scrollspy navigation** that highlights your place
- 🗂️ **Interactive tool tabs** for Claude / Codex / Gemini / Copilot
- ✅ **Launch checklist** with progress saved in your browser
- 🔍 **Filterable prompt library**
- 🌗 **Dark / light theme** (remembers your choice, respects system setting)
- 📊 Reading-progress bar, back-to-top, mobile nav, print-friendly
- ♿ Responsive and accessible

## Files

| File | Purpose |
|------|---------|
| `index.html` | The complete guide (open it directly in a browser) |
| `HOW-TO-build-lead-gen-email-app-with-AI.md` | The same content in plain Markdown |
| `README.md` | This file |

## Preview locally

Just open the file:

```bash
open index.html        # macOS
# or serve it:
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Deploy to GitHub Pages

### Option A — Web UI

```bash
git init
git add .
git commit -m "Add Lead Engine field guide"
git branch -M main
git remote add origin https://github.com/<you>/lead-engine-guide.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `(root)` → Save.**
Your site goes live at `https://<you>.github.io/lead-engine-guide/`.

### Option B — GitHub CLI (one shot)

```bash
gh repo create lead-engine-guide --public --source=. --push
gh api -X POST repos/:owner/lead-engine-guide/pages -f source[branch]=main -f source[path]=/
```

> GitHub Pages serves `index.html` as the homepage automatically — keep that filename.

## License

Free to use, fork, edit, and ship.
