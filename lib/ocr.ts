"use client";

export interface OcrResult {
  text: string;
  confidence: number;
}

export const OCR_MAX_BYTES = 8 * 1024 * 1024;

/**
 * Preprocesses an image on an offscreen HTML5 canvas to boost contrast
 * and threshold text lines for higher multilingual OCR accuracy.
 */
async function preprocessImage(file: File): Promise<Blob> {
  if (typeof window === "undefined" || !("createImageBitmap" in window)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;

    // Contrast boost & grayscale conversion
    for (let i = 0; i < d.length; i += 4) {
      const avg = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      // High contrast linear stretch
      const contrast = avg > 140 ? 255 : avg < 90 ? 0 : avg;
      d[i] = contrast;
      d[i + 1] = contrast;
      d[i + 2] = contrast;
    }
    ctx.putImageData(imgData, 0, 0);

    return await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob || file), "image/png");
    });
  } catch {
    return file;
  }
}

/**
 * Reads text from an image entirely in the browser. Language data and the
 * worker come from the public CDN, so nothing about the file is uploaded.
 */
export async function extractTextFromImage(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<OcrResult> {
  const processedBlob = await preprocessImage(file);
  const tesseract = await import("tesseract.js");
  const worker = await tesseract.createWorker(["eng", "hin", "guj"], 1, {
    logger: (message: { status: string; progress: number }) => {
      if (message.status === "recognizing text") onProgress?.(Math.round(message.progress * 100));
    },
  });
  try {
    const { data } = await worker.recognize(processedBlob);
    return {
      text: (data.text ?? "").replace(/[ \t]+/g, " ").trim(),
      confidence: Math.round(data.confidence ?? 0),
    };
  } finally {
    await worker.terminate();
  }
}
