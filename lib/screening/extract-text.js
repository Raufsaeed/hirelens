import "server-only";
import { PDFParse } from "pdf-parse";

// Reads the text from a PDF CV with pdf-parse. Throws when the PDF is damaged or can't be opened.
export async function extractPdfText(bytes) {
  const parser = new PDFParse({ data: bytes });
  try {
    const result = await parser.getText();
    // pdf-parse adds a "-- 1 of 2 --" marker after each page; it is not part of the CV.
    return String(result?.text || "").replace(/^-- \d+ of \d+ --$/gm, "");
  } finally {
    await parser.destroy();
  }
}
