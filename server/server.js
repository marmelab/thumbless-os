import cors from "cors";
import "dotenv/config";
import express from "express";
import { handleWebSearch } from "./webSearch.js";

import mailer from "./mailer.js";

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.OPENAI_API_KEY;
const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
const unsplashUrl = process.env.UNSPLASH_API_SEARCH_URL;

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

app.get("/unsplash-image", async (req, res) => {
  const query = req.query.q;
  console.log(`[UNSPLASH] Search image for: "${query}" ${process.env.UNSPLASH_ACCESS_KEY}`);

  if (!query) {
    return res.status(400).json({ error: "Missing search query param" });
  }
  if (!unsplashAccessKey) {
    console.error("[UNSPLASH] Error : please configure your API Key");
    return res.status(500).json({ error: "Unsplash API key not configured on the server." });
  }
  try {
    const apiUrl = `${unsplashUrl}?query=${encodeURIComponent(query)}&client_id=${unsplashAccessKey}&orientation=landscape&per_page=1`;
    console.log(`[UNSPLASH] Call to unsplash API: ${apiUrl}`);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      let errorText;
      try {
        const data = await response.json();
        errorText = Array.isArray(data.errors)
          ? data.errors.join(", ")
          : JSON.stringify(data);
      } catch {
        const text = await response.text();
        errorText = `Non-JSON error from Unsplash API: ${text.slice(0, 200)}...`;
      }
      console.error(`[UNSPLASH] API Error (${response.status}): ${errorText}`);
      return res.status(response.status).json({ error: `Unsplash API Error: ${errorText}` });
    }
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const img = data.results[0];
      const imageUrl = img.urls?.regular;
      const imageAlt = img.alt_description || img.description || query;
      const imageSource = img.links?.html;
      const imageAuthor = img.user?.name;

      console.log(`[UNSPLASH] Résultat trouvé: ${imageUrl}`);

      res.json({
        url: imageUrl,
        alt: imageAlt,
        source: imageSource,
        author: imageAuthor,
      });
    } else {
      console.log(`[UNSPLASH] No Unsplash image found: "${query}"`);
      res.status(404).json({ error: "No Unsplash image found for this query" });
    }
  } catch (error) {
    console.error("[UNSPLASH] An unexpected server error occurred while fetching Unsplash image :", error);
    res.status(500).json({ error: "An unexpected server error occurred while fetching Unsplash image." });
  }
});

// API route for web search
app.get("/web-search", async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }
  try {
    const result = await handleWebSearch(query);
    res.json({ result });
  } catch (error) {
    console.error("Web search error:", error);
    res
      .status(500)
      .json({ error: "Failed to perform web search", message: error.message });
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
