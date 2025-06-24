import express from "express";
import cors from "cors";
import "dotenv/config";

import mailer from "./mailer.js";

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.OPENAI_API_KEY;

app.use(cors());

app.use(express.json());

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

app.post("/email", async (req, res) => {
  const { to, from, subject, body } = req.body;

  if (!to || !from || !subject || !body) {
    return res.status(400).json({
      error: "Missing required fields: to, from, subject, body",
    });
  }

  try {
    const result = mailer.send(to, from, subject, body);
    res
      .status(200)
      .json({
        message: result ? "Email sent successfully" : "Failed to send email",
      });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Render the React client
app.use("*", async (req, res, next) => {
  const url = req.originalUrl;

  try {
    const template = await vite.transformIndexHtml(
      url,
      fs.readFileSync("./client/index.html", "utf-8"),
    );
    const { render } = await vite.ssrLoadModule("./client/entry-server.jsx");
    const appHtml = await render(url);
    const html = template.replace(`<!--ssr-outlet-->`, appHtml?.html);
    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  } catch (e) {
    vite.ssrFixStacktrace(e);
    next(e);
  }
});

app.listen(port, () => {
  console.log(`Express server running on *:${port}`);
});
