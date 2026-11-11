// Test files made in memory: a small real PDF with text, a fake .docx and a PDF over 5 MB.

const DEFAULT_LINES = ["Ali Raza", "Junior Web Developer", "Skills: HTML, CSS, React, Git"];

// "(text)" for a PDF content stream.
export function pdfText(text) {
  return `(${text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")})`;
}

// A one-page PDF whose text can be read by pdf-parse (each line is drawn on the page).
// `extra`: more PDF drawing commands, for example white text: "1 1 1 rg BT /F1 12 Tf 72 300 Td (Hi) Tj ET".
export function makePdf(lines = DEFAULT_LINES, { extra = "" } = {}) {
  const content = ["BT", "/F1 12 Tf", "72 760 Td", "16 TL"]
    .concat(lines.map((line) => `${pdfText(line)} Tj T*`))
    .concat("ET", extra)
    .join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [];
  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf);
}

export function pdfFile(name = "ali-cv.pdf", lines, options) {
  return { name, mimeType: "application/pdf", buffer: makePdf(lines, options) };
}

export function docxFile(name = "ali-cv.docx") {
  return {
    name,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    buffer: Buffer.from("PK\u0003\u0004 not a pdf"),
  };
}

// A PDF just over 7 MB (a real PDF header with padding).
export function bigPdfFile(name = "big-cv.pdf") {
  const pdf = makePdf();
  return { name, mimeType: "application/pdf", buffer: Buffer.concat([pdf, Buffer.alloc(7 * 1024 * 1024)]) };
}

// A real 1×1 PNG (for logo uploads).
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

export function pngFile(name = "logo.png") {
  return { name, mimeType: "image/png", buffer: TINY_PNG };
}

// A PNG just over 3 MB (a real PNG header with padding).
export function bigPngFile(name = "big-logo.png") {
  return { name, mimeType: "image/png", buffer: Buffer.concat([TINY_PNG, Buffer.alloc(3 * 1024 * 1024)]) };
}
