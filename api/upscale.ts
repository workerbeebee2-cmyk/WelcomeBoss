import type { VercelRequest, VercelResponse } from '@vercel/node';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { image, prompt } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    const apiKey = process.env.STABILITY_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing STABILITY_API_KEY. Please add the STABILITY_API_KEY environment variable in your Vercel project settings." });
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
      return res.status(response.status).json({ error: `Stability API Error: ${response.status} - ${text}` });
    }

    const arrayBuffer = await response.arrayBuffer();
    const responseBuffer = Buffer.from(arrayBuffer);
    const responseBase64 = `data:image/png;base64,${responseBuffer.toString("base64")}`;

    return res.status(200).json({ result: responseBase64 });
  } catch (error: any) {
    console.error("/api/upscale Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
