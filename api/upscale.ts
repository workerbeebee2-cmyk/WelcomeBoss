import type { VercelRequest, VercelResponse } from '@vercel/node';

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
        "api-key": apiKey
      },
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("DeepAI API Error:", response.status, text);
      return res.status(response.status).json({ error: `DeepAI API Error: ${response.status} - ${text}` });
    }

    const data = await response.json() as { output_url: string };

    return res.status(200).json({ result: data.output_url });
  } catch (error: any) {
    console.error("/api/upscale Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
