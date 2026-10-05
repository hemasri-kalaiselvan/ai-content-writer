export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  const { topic, mode, tone, count, brandVoice } = req.body;

  if (!topic || topic.trim() === "") {
    return res.status(400).json({ error: "Please enter some text first." });
  }

  const key = process.env.GEMINI_KEY;
  if (!key) {
    return res.status(500).json({ error: "Server is missing its API key." });
  }

  const modeInstructions = {
    linkedin: `Write a short, engaging LinkedIn post about the following topic. Include a strong hook, a clear point, and a call to action. Keep it under 120 words.`,
    email: `Rewrite the following email so it sounds warm, polite, and professional, while keeping the original meaning. Return only the rewritten email.`,
    blog: `Turn the following blog content or idea into a punchy social media post suitable for LinkedIn or X. Keep it under 100 words with a hook and a takeaway.`,
    product: `Write a compelling product description for the following item. Highlight its key features and the benefits to the buyer. Keep it clear, vivid, and under 100 words.`,
    outreach: `Write a concise, personable cold outreach message based on the following details. It should open with a genuine hook, state the value clearly, and end with a soft call to action. Avoid sounding pushy or generic.`,
    ad: `Write short, punchy ad copy for the following product or offer. Give a scroll-stopping headline and 1-2 lines of persuasive body text. Keep it tight and benefit-focused.`
  };

  const toneNote = tone && tone !== "default" ? ` Use a ${tone} tone.` : "";

  const voiceNote = brandVoice && brandVoice.trim()
    ? ` Write in this brand voice: ${brandVoice.trim()}.`
    : "";

  const howMany = Math.min(Math.max(parseInt(count) || 1, 1), 5);
  const variationNote = howMany > 1
    ? ` Produce ${howMany} distinct variations. Separate each variation with a line containing only "---".`
    : "";

  const instruction = (modeInstructions[mode] || modeInstructions.linkedin) + toneNote + voiceNote + variationNote;
  const prompt = `${instruction}\n\nInput:\n${topic}`;

  try {
    // Use the streaming endpoint so text arrives progressively
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:streamGenerateContent?alt=sse&key=${key}`;

    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!upstream.ok || !upstream.body) {
      const errData = await upstream.json().catch(() => ({}));
      const msg = errData.error?.message || "API request failed.";
      return res.status(500).json({ error: msg });
    }

    // Stream chunks down to the browser as plain text
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Server-sent events come as lines beginning with "data: "
      const lines = buffer.split("\n");
      buffer = lines.pop(); // keep the last partial line

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const jsonStr = trimmed.slice(5).trim();
        if (!jsonStr || jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const piece = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (piece) res.write(piece);
        } catch (e) {
          // ignore partial/non-JSON lines
        }
      }
    }

    res.end();
  } catch (e) {
    if (!res.headersSent) {
      res.status(500).json({ error: "Request failed. Please try again." });
    } else {
      res.end();
    }
  }
}
