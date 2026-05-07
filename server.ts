import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import FormData from "form-data";

const upload = multer({ storage: multer.memoryStorage() });

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

      const apiKey = process.env.STABILITY_API_KEY;
      if (!apiKey) {
        throw new Error("STABILITY_API_KEY environment variable is required to use Stable Diffusion.");
      }

      // Convert base64 data to buffer
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, 'base64');

      const formData = new FormData();
      formData.append("image", imageBuffer, { filename: "image.png", contentType: "image/png" });
      if (prompt) {
        formData.append("prompt", prompt);
      }
      formData.append("output_format", "png");

      const response = await fetch("https://api.stability.ai/v2beta/stable-image/upscale/conservative", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "image/*",
          ...formData.getHeaders()
        },
        body: formData as any,
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Stability API Error:", response.status, text);
        throw new Error(`Stability API Error: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const responseBuffer = Buffer.from(arrayBuffer);
      const responseBase64 = `data:image/png;base64,${responseBuffer.toString("base64")}`;

      return res.json({ result: responseBase64 });
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
