export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  const { topic, mode, tone, count } = req.body;

  if (!topic || topic.trim() === "") {
    return res.status(400).json({ error: "Please enter some text first." });
  }

  const key = process.env.GEMINI_KEY;
  if (!key) {
    return res.status(500).json({ error: "Server is missing its API key." });
  }

  // Build the instruction based on the chosen mode
  const modeInstructions = {
    linkedin: `Write a short, engaging LinkedIn post about the following topic. Include a strong hook, a clear point, and a call to action. Keep it under 120 words.`,
    email: `Rewrite the following email so it sounds warm, polite, and professional, while keeping the original meaning. Return only the rewritten email.`,
    blog: `Turn the following blog content or idea into a punchy social media post suitable for LinkedIn or X. Keep it under 100 words with a hook and a takeaway.`
  };

  const toneNote = tone && tone !== "default"
    ? ` Use a ${tone} tone.`
    : "";

  const howMany = Math.min(Math.max(parseInt(count) || 1, 1), 5);
  const variationNote = howMany > 1
    ? ` Produce ${howMany} distinct variations. Separate each variation with a line containing only "---".`
    : "";

  const instruction = (modeInstructions[mode] || modeInstructions.linkedin) + toneNote + variationNote;
  const prompt = `${instruction}\n\nInput:\n${topic}`;

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );

    const data = await r.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message || "API error." });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(500).json({ error: "No response from the model." });
    }

    // Split into variations if we asked for more than one
    const results = howMany > 1
      ? text.split(/\n?---\n?/).map(s => s.trim()).filter(Boolean)
      : [text.trim()];

    res.status(200).json({ results });
  } catch (e) {
    res.status(500).json({ error: "Request failed. Please try again." });
  }
}
