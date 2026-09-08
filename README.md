# AI Content Writer

> A live web tool that generates marketing copy in one click — pick a mode, set the tone, choose how many variations, and copy or download the result.

**Tech:** HTML, CSS, JavaScript, Node.js
**Tools:** GitHub, Vercel
**AI Tools:** ChatGPT, Claude, Gemini
**Live:** https://ai-content-writer-hemasri.vercel.app/

A live web tool that generates marketing copy in one click — LinkedIn posts, rewritten emails, blog-to-social captions, product descriptions, cold outreach, and ad copy. Pick a mode, set the tone, choose how many variations you want, and copy or download the result. Output streams in word by word as it's written. No prompt-writing required.

At its core it's an **AI content writer** — essentially a "wrapper" around an existing model like Gemini. You send a prompt to an API, get text back, and display it. No training data, no machine learning math, no infrastructure to run yourself.

**[Live demo](https://ai-content-writer-hemasri.vercel.app/)**

---

## Why build this when ChatGPT, Gemini exist?

Anyone can use ChatGPT. Far fewer people can wire up a front end, a hidden backend, an API call, secret key management, and a live deployment. That's the skill being shown here. The content writer is just the visible shell around infrastructure that's identical to what real AI products run on.

A blank chatbot also makes the user do all the work. This tool bakes the expertise in: pick a mode, type a few words, get expert output in one click. The value isn't the AI — it's that the expertise is built in, so anyone gets expert results without knowing how to ask.

---

## Features

- **Six writing modes** — LinkedIn post, rewrite email, blog-to-social, product description, cold outreach, and ad copy. Each mode changes the input and the instructions sent to the model.
- **Tone selector** — default, formal, casual, punchy, or friendly.
- **Brand voice** — set a house style once (e.g. "friendly, witty, never uses jargon") and the app remembers it on your device and applies it to every generation.
- **Multiple variations** — generate 1, 3, or 5 versions at once.
- **Live streaming** — output appears word by word as it's written, instead of waiting for the whole thing.
- **Copy or download** — every result has its own copy button and a download-as-text button.

---

## How it works

The app has three parts, and the API key never touches the visitor's browser:

1. **Front end** (`index.html`) — the page with the tabs, controls, and result cards, hosted on Vercel.
2. **Hidden backend** (`api/write.js`) — a serverless function that holds the API key as a secret environment variable, builds the prompt from the chosen mode, tone, and brand voice, and streams the response from Gemini.
3. **Gemini API** — generates the copy and sends it back up to the screen.

```
index.html  →  api/write.js  →  Gemini API
 (browser)     (secret key)     (writes copy)

Then the copy travels back the same way and appears on screen.
```

The API key lives only in Vercel's environment variables, so it stays hidden from anyone viewing the site's source.

---

## Tech stack

- **Front end:** HTML, CSS, vanilla JavaScript
- **Backend:** Vercel serverless function (Node.js)
- **AI model:** Google Gemini (`gemini-3.6-flash`, free tier)
- **Hosting:** Vercel

---

## How I built it

### Step 1: Create a new GitHub repo
On github.com, click **New repository**, name it `ai-content-writer`, make it public, and check "Add a README." For the description: *Full-stack AI content writing tool that generates LinkedIn posts, emails, and marketing copy from a short prompt — HTML front end, serverless backend, and Gemini API. Deployed on Vercel.*

### Step 2: Add the two files
Use GitHub's **Add file → Create new file** button right in the browser — no local install needed.

- First file — the webpage. Name it `index.html`.
- Second file — the secret backend. Name it exactly `api/write.js` (typing `api/write.js` as the filename creates the folder automatically).

The key is never in `index.html` — it lives only in `process.env.GEMINI_KEY`, set secretly in Vercel. That's the whole trick.

### Step 3: Get a free Gemini API key
1. **Go to Google AI Studio** — open aistudio.google.com and sign in with a Google account. No credit card, no billing setup.
2. **Open the API keys page** — click **Get API key** (usually top-left or in the menu).
3. **Create a new key** — click **Create API key** and accept the default project. It generates a long string — that's your key.
4. **Copy the key** — copy it and keep it safe. Treat it like a password; never paste it into any public or shared page.
5. **Paste it into Vercel** — as an environment variable named `GEMINI_KEY` (covered in Step 5).

### Step 4: Connect the repo to Vercel
Go to vercel.com, sign up with your GitHub account (free). Click **Add New → Project**, pick the `ai-content-writer` repo, and click **Import**.

### Step 5: Add the secret key in Vercel
Before deploying, open the **Environment Variables** section and add:
- **Name:** `GEMINI_KEY`
- **Value:** your free Gemini key from aistudio.google.com

Then click **Deploy** and wait about a minute.

> Note: environment variables only apply on a fresh deployment. If you add the key after deploying, trigger a redeploy from the Deployments tab.

### Step 6: Get a live URL
Vercel gives you something like `ai-content-writer-yourname.vercel.app`. Open it — the tool works, live, for anyone, and the key stays hidden.

- Live site: https://ai-content-writer-hemasri.vercel.app/
- Backend endpoint: https://ai-content-writer-hemasri.vercel.app/api/write

### Step 7: Link it from the portfolio
In the portfolio's project section, add the project with a link to the Vercel URL — real, working, and clickable.

---

## What I learned

- Connecting a front end to an AI model through a serverless backend
- Keeping API keys secret with environment variables instead of exposing them in client code
- Building one app that handles multiple modes, tones, voices, and output counts from a single interface
- Streaming a model's response to the browser so text appears as it's written
- Prompt design — baking expert instructions into the app so the user doesn't have to
- Deploying, updating, and debugging a live app on Vercel (including swapping the model when Google retired the old one)

---

## Possible next steps

- Let users save a history of past generations
- Team/shared brand voices instead of device-only memory
- Export directly to a scheduling tool or as a formatted post
- Usage limits and a lightweight sign-in
