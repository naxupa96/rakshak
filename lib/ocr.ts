"use client";

export interface OcrResult {
  text: string;
  confidence: number;
}

export const OCR_MAX_BYTES = 8 * 1024 * 1024;

/**
 * Reads text from an image entirely in the browser. Language data and the
 * worker come from the public CDN, so nothing about the file is uploaded.
 */
export async function extractTextFromImage(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<OcrResult> {
  const tesseract = await import("tesseract.js");
  const worker = await tesseract.createWorker(["eng", "hin", "guj"], 1, {
    logger: (message: { status: string; progress: number }) => {
      if (message.status === "recognizing text") onProgress?.(Math.round(message.progress * 100));
    },
  });
  try {
    const { data } = await worker.recognize(file);
    return {
      text: (data.text ?? "").replace(/[ \t]+/g, " ").trim(),
      confidence: Math.round(data.confidence ?? 0),
    };
  } finally {
    await worker.terminate();
  }
}
