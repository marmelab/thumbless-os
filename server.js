import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.OPENAI_API_KEY;

app.use(cors());

// API route for token generation
app.get("/token", async (req, res) => {
  try {
    console.log("Requesting token from OpenAI...");
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini-realtime-preview",
          voice: "verse",
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", response.status, errorData);
      return res.status(response.status).json({
        error: `OpenAI API error: ${response.status}`,
        details: errorData,
      });
    }

    const data = await response.json();
    console.log("Token received successfully");
    res.json(data);
  } catch (error) {
    console.error("Token generation error:", error);
    res
      .status(500)
      .json({ error: "Failed to generate token", message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Express server running on *:${port}`);
});
