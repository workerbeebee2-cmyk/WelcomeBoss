export async function enhanceImageWithGemini(base64Data: string, mimeType: string): Promise<string> {
  const response = await fetch("/api/upscale", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64Data, prompt: "a highly detailed, ultra-sharp, photorealistic portrait" }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown API err" }));
    throw new Error(err.error || `Server responded with ${response.status}`);
  }

  const data = await response.json();
  return data.result;
}

