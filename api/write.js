export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  const { topic } = req.body;
  const key = process.env.GEMINI_KEY; // secret, stored in Vercel

  const prompt = `Write a short, friendly LinkedIn post about: ${topic}. Under 100 words, with a hook and a call to action.`;

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
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    res.status(200).json({ result: text || "No response." });
  } catch (e) {
    res.status(500).json({ error: "API call failed." });
  }
}
