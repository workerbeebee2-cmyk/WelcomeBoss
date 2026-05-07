import * as tf from '@tensorflow/tfjs';
import Upscaler from 'upscaler';

// Initialize upscaler. It will load default model (2x upscaling)
const upscaler = new Upscaler();

export async function enhanceImageWithGemini(base64Data: string, mimeType: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const img = new Image();
      img.onload = async () => {
        try {
          // Upscaler takes an image element and returns a base64 string
          const upscaledBase64 = await upscaler.upscale(img);
          resolve(upscaledBase64);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      
      if (!base64Data.startsWith('data:')) {
         img.src = `data:${mimeType || 'image/jpeg'};base64,${base64Data}`;
      } else {
         img.src = base64Data;
      }
    } catch (err) {
      reject(err);
    }
  });
}
