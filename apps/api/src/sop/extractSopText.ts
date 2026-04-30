import mammoth from "mammoth";
import pdf from "pdf-parse";
import type { Express } from "express";

export async function extractSopText(file: Express.Multer.File) {
  const name = file.originalname.toLowerCase();

  if (name.endsWith(".txt") || name.endsWith(".md") || file.mimetype.startsWith("text/")) {
    return file.buffer.toString("utf8");
  }

  if (name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }

  if (name.endsWith(".pdf")) {
    const result = await pdf(file.buffer);
    return result.text;
  }

  throw new Error("Unsupported SOP file type. Use PDF, DOCX, TXT, or Markdown.");
}
