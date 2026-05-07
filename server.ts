import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use raw JSON for large base64 strings if necessary
  app.use(express.json({ limit: "50mb" }));

  app.post("/api/upscale", async (req, res) => {
    try {
      const { image, prompt } = req.body;
      if (!image) {
        return res.status(400).json({ error: "No image provided" });
      }

      // We'll use DeepAI quickstart API key as a fallback if the env var isn't set
      const apiKey = process.env.DEEPAI_API_KEY || "quickstart-QUdJIGlzIGNvbWluZy";

      // Convert base64 data to buffer
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, 'base64');

      const formData = new FormData();
      const blob = new Blob([imageBuffer], { type: "image/png" });
      formData.append("image", blob, "image.png");

      const response = await fetch("https://api.deepai.org/api/torch-srgan", {
        method: "POST",
        headers: {
          "api-key": apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("DeepAI API Error:", response.status, text);
        throw new Error(`DeepAI API Error: ${response.status} - ${text}`);
      }

      const data = await response.json() as { output_url: string };
      
      return res.json({ result: data.output_url });
    } catch (error: any) {
      console.error("/api/upscale Error:", error);
      return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
