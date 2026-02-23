export default async function handler(req, res) {

  // ===== METHOD CHECK =====
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ===== API KEY CHECK =====
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ 
      error: "OPENAI_API_KEY is not defined in environment variables." 
    });
  }

  try {

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message provided." });
    }

    // ===== OPENAI CALL =====
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Ti si turistički informator za Valpovo." },
          { role: "user", content: message }
        ],
        temperature: 0.7
      })
    });

    const data = await openaiResponse.json();

    // ===== DIAGNOSTIC RETURN (FULL RESPONSE) =====
    return res.status(200).json({
      success: true,
      openai_status: openaiResponse.status,
      openai_response: data
    });

  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}
