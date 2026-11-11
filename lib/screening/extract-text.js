import "server-only";
import { PDFParse } from "@/lib/screening/pdf";

// Reads the text from a PDF CV with pdf-parse. Throws when the PDF is damaged or can't be opened.
// It never shares PDF.js state with the CV check (lib/validation/cv-content.js): each call opens its own
// parser on its own copy of the bytes, and PDF.js gives every document its own worker.
export async function extractPdfText(bytes) {
  const parser = new PDFParse({ data: bytes.slice() });
  try {
    const result = await parser.getText();
    // pdf-parse adds a "-- 1 of 2 --" marker after each page; it is not part of the CV.
    return String(result?.text || "").replace(/^-- \d+ of \d+ --$/gm, "");
  } finally {
    await parser.destroy();
  }
}
