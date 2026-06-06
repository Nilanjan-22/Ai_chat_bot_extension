# Disha

**Have you ever got stuck while doing something online?** Whether you're navigating a confusing government portal or filling out a complex form, Disha is here to help. 

Disha is a privacy-first Chrome extension and Node.js backend designed to provide read-only website guidance. The assistant reads safe page structure, explains steps, and replies in English, Hindi, or Bengali—all without ever filling forms or submitting your personal data.

## What is included

- Chrome Manifest V3 side panel extension
- Tailwind CSS side panel UI
- Content script that extracts safe page context only
- Background service worker that requests per-site access
- Node.js REST backend with:
  - health endpoint
  - chat endpoint
  - curated site guide lookup
- optional OpenAI-powered responses if `OPENAI_API_KEY` is set
- optional OpenRouter web-grounded responses when `Use official web grounding` is enabled in the extension
- built-in fallback guidance when no model key is available

## Project structure

- `backend/` Node.js REST API
- `extension/` Chrome extension source
- `dist/extension/` built extension output
- `scripts/build-extension.mjs` bundler for the extension

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Start the backend:

```bash
npm run dev:backend
```

3. Build the extension:

```bash
npm run build
```

4. Load the extension in Chrome:
   - Open `chrome://extensions`
   - Enable Developer mode
   - Click `Load unpacked`
   - Select `dist/extension`

## Environment

Copy `.env.example` to `.env` and set values as needed.

- `PORT`: backend port, default `8787`
- `OPENAI_API_KEY`: optional; enables model-backed answers
- `OPENAI_BASE_URL`: optional; use `https://openrouter.ai/api/v1` for OpenRouter
- `OPENAI_MODEL`: optional; can be `openai/gpt-oss-120b` on OpenRouter
- `OPENROUTER_SITE_URL`: optional OpenRouter attribution header
- `OPENROUTER_APP_TITLE`: optional OpenRouter attribution header

## OpenRouter setup

If you want to use OpenRouter with `gpt-oss-120b`, use a local `.env` file like this:

```bash
PORT=8787
OPENAI_API_KEY=your_openrouter_key
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL=openai/gpt-oss-120b
OPENROUTER_SITE_URL=http://localhost
OPENROUTER_APP_TITLE=Disha
```

`.env.example` is only a template. The backend reads `.env` at runtime.

## Current MVP behavior

- The extension asks the user for access to the current site before reading it.
- The content script reads visible structure only:
  - headings
  - field labels
  - helper text
  - buttons
  - step indicators
  - validation messages
- It does not read typed values, passwords, OTPs, or uploaded file contents.
- Backend responses stay read-only and avoid assisted fill.
- When web grounding is enabled, the backend can use OpenRouter's `openrouter:web_search` tool to retrieve current web information.
- Web grounding is designed to stay narrow:
  - it prefers the current host and any domains configured in `backend/data/site-guides.json`
  - it returns citations that are shown in the side panel

## Customizing trusted site knowledge

Edit `backend/data/site-guides.json` to add supported websites and official reference links. This lets you gradually improve reliability for the specific portals you care about most.

You can also add `allowedDomains` to a guide entry so web grounding stays limited to the official domains you trust for that site.
