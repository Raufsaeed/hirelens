import "server-only";
// pdf-parse, set up the way it recommends for serverless hosts like Vercel. "pdf-parse/worker" loads, with
// plain imports that Vercel bundles with the function, the canvas helpers PDF.js needs in Node (without them
// PDF.js fails with "DOMMatrix is not defined") and the PDF.js worker. Both CV readers import PDFParse from here.
import "pdf-parse/worker";

export { PDFParse } from "pdf-parse";
