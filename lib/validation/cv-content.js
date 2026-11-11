import "server-only";
import { PDFParse } from "pdf-parse";
import { BLOCKED_CV_ERROR, HIDDEN_CV_TEXT_ERROR, isBlockedText } from "@/lib/validation/injection";

// CV checks at upload (apply and default CV), without AI:
// 1. hidden text: white or near-white text, text under 4pt, text outside the page, or invisible text;
// 2. the prompt-injection score on the CV text.
// Returns an error message to show, or null when the CV is fine.
// A PDF that can't be read is let through: screening marks it "CV could not be read" and AI never sees it.

const MIN_FONT_SIZE = 4; // points
const NEAR_WHITE = 240; // each of red, green and blue at least this (of 255)
const PAGE_MARGIN = 2; // points of tolerance at the page edges
const MIN_HIDDEN_CHARACTERS = 3; // a stray white bullet or space is not hidden text

// PDF.js drawing operation numbers (pdf-parse ships PDF.js, so no extra package is needed).
const OPS = {
  save: 10,
  restore: 11,
  transform: 12,
  beginText: 31,
  setLeading: 36,
  setFont: 37,
  setTextRenderingMode: 38,
  setTextRise: 39,
  moveText: 40,
  setLeadingMoveText: 41,
  setTextMatrix: 42,
  nextLine: 43,
  showText: 44,
  setFillColorN: 55,
  setFillRGBColor: 59,
  shadingFill: 62,
  paintFormXObjectBegin: 74,
  paintFormXObjectEnd: 75,
  beginGroup: 76,
  endGroup: 77,
  paintImageMaskXObject: 83,
  paintImageMaskXObjectGroup: 84,
  paintImageXObject: 85,
  paintInlineImageXObject: 86,
  paintInlineImageXObjectGroup: 87,
  paintImageXObjectRepeat: 88,
  paintImageMaskXObjectRepeat: 89,
  paintSolidColorImageMask: 90,
  constructPath: 91,
  setFillTransparent: 93,
};
// Paint operations that fill a shape (fill, eoFill, fillStroke, eoFillStroke, closeFillStroke, closeEOFillStroke).
const FILL_OPS = new Set([22, 23, 24, 25, 26, 27]);
const IMAGE_OPS = new Set([
  OPS.paintImageMaskXObject,
  OPS.paintImageMaskXObjectGroup,
  OPS.paintImageXObject,
  OPS.paintInlineImageXObject,
  OPS.paintInlineImageXObjectGroup,
  OPS.paintImageXObjectRepeat,
  OPS.paintImageMaskXObjectRepeat,
  OPS.paintSolidColorImageMask,
]);
const INVISIBLE_TEXT_MODE = 3;
const ANNOTATIONS_OFF = 0; // form fields and comments are not part of the CV text

const IDENTITY = [1, 0, 0, 1, 0, 0];

// m1 x m2: m2 is applied first, then m1 (the PDF way of joining two transforms).
function multiply(m1, m2) {
  return [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ];
}

// PDF.js may send a matrix as a typed array; returns a plain [a, b, c, d, e, f] or null.
function matrixFrom(value) {
  return value?.length === 6 ? Array.from(value, Number) : null;
}

function applyTo(m, x, y) {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}

// The page-space box of a box [minX, minY, maxX, maxY] drawn with transform m.
function boxOf(m, [minX, minY, maxX, maxY]) {
  const corners = [applyTo(m, minX, minY), applyTo(m, maxX, minY), applyTo(m, minX, maxY), applyTo(m, maxX, maxY)];
  const xs = corners.map(([x]) => x);
  const ys = corners.map(([, y]) => y);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

function inside([x, y], [minX, minY, maxX, maxY], margin = 0) {
  return x >= minX - margin && x <= maxX + margin && y >= minY - margin && y <= maxY + margin;
}

// "#f8f8f8" -> true.
function isNearWhite(hex) {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(hex || ""));
  return Boolean(match) && match.slice(1).every((part) => parseInt(part, 16) >= NEAR_WHITE);
}

// Letters and digits in one shown piece of text.
function visibleCharacters(glyphs) {
  const text = (glyphs || []).map((glyph) => (typeof glyph === "object" && glyph ? glyph.unicode || "" : "")).join("");
  return (text.match(/[\p{L}\p{N}]/gu) || []).length;
}

// Counts letters on one page that a reader can't see but a text reader (and so the AI) would.
function countHiddenOnPage({ fnArray, argsArray }, pageBox) {
  // paleFill: the fill colour is white, near-white or transparent.
  let state = { ctm: IDENTITY, paleFill: false, fontSize: 0, leading: 0, rise: 0, mode: 0 };
  const stack = [];
  let text = { matrix: IDENTITY, x: 0, y: 0 };
  // Coloured shapes and images: white text on top of them is a normal design (for example a dark header).
  const colouredAreas = [];
  const imageAreas = [];
  // White and invisible text is decided at the end of the page, once every background is known.
  const unsure = [];
  let hidden = 0;

  for (let index = 0; index < fnArray.length; index++) {
    const fn = fnArray[index];
    const args = argsArray[index] || [];
    switch (fn) {
      case OPS.save:
        stack.push(state);
        state = { ...state };
        break;
      case OPS.restore:
        state = stack.pop() || state;
        break;
      case OPS.transform:
        state.ctm = multiply(state.ctm, matrixFrom(args) || IDENTITY);
        break;
      case OPS.paintFormXObjectBegin:
        stack.push(state);
        state = { ...state, ctm: multiply(state.ctm, matrixFrom(args[0]) || IDENTITY) };
        break;
      case OPS.beginGroup:
        stack.push(state);
        state = { ...state, ctm: multiply(state.ctm, matrixFrom(args[0]?.matrix) || IDENTITY) };
        break;
      case OPS.paintFormXObjectEnd:
      case OPS.endGroup:
        state = stack.pop() || state;
        break;
      case OPS.setFillRGBColor:
        state.paleFill = isNearWhite(args[0]);
        break;
      case OPS.setFillColorN: // a gradient or pattern: counts as a colour
        state.paleFill = false;
        break;
      case OPS.setFillTransparent:
        state.paleFill = true;
        break;
      case OPS.constructPath: {
        // [paint operation, path data, box of the path]
        if (FILL_OPS.has(args[0]) && !state.paleFill && args[2]?.length === 4) {
          colouredAreas.push(boxOf(state.ctm, Array.from(args[2])));
        }
        break;
      }
      case OPS.shadingFill:
        colouredAreas.push(pageBox);
        break;
      case OPS.beginText:
        text = { matrix: IDENTITY, x: 0, y: 0 };
        break;
      case OPS.setTextMatrix:
        text = { matrix: matrixFrom(args[0]) || matrixFrom(args) || IDENTITY, x: 0, y: 0 };
        break;
      case OPS.moveText:
        text = { ...text, x: text.x + args[0], y: text.y + args[1] };
        break;
      case OPS.setLeadingMoveText:
        state.leading = -args[1];
        text = { ...text, x: text.x + args[0], y: text.y + args[1] };
        break;
      case OPS.setLeading:
        state.leading = args[0];
        break;
      case OPS.nextLine:
        text = { ...text, y: text.y - state.leading };
        break;
      case OPS.setFont:
        state.fontSize = Math.abs(Number(args[1]) || 0);
        break;
      case OPS.setTextRise:
        state.rise = Number(args[0]) || 0;
        break;
      case OPS.setTextRenderingMode:
        state.mode = Number(args[0]) || 0;
        break;
      case OPS.showText: {
        const count = visibleCharacters(args[0]);
        if (!count) break;
        const matrix = multiply(state.ctm, text.matrix);
        const point = applyTo(matrix, text.x, text.y + state.rise);
        const size = state.fontSize * Math.hypot(matrix[2], matrix[3]);
        if (size < MIN_FONT_SIZE || !inside(point, pageBox, PAGE_MARGIN)) hidden += count;
        else if (state.mode === INVISIBLE_TEXT_MODE) unsure.push({ point, count, needs: "image" });
        else if (state.paleFill) unsure.push({ point, count, needs: "colour" });
        break;
      }
      default:
        if (IMAGE_OPS.has(fn)) imageAreas.push(boxOf(state.ctm, [0, 0, 1, 1]));
    }
  }

  // White text is hidden unless it sits on a coloured shape or an image.
  // Invisible text is hidden unless it sits on an image (a scanned CV's text layer).
  for (const { point, count, needs } of unsure) {
    const onImage = imageAreas.some((area) => inside(point, area));
    const onColour = needs === "colour" && colouredAreas.some((area) => inside(point, area));
    if (!onImage && !onColour) hidden += count;
  }
  return hidden;
}

async function hasHiddenText(parser) {
  try {
    // getText has opened the document; read each page's drawing operations from it.
    const doc = await parser.load();
    let hidden = 0;
    for (let number = 1; number <= doc.numPages; number++) {
      const page = await doc.getPage(number);
      const operators = await page.getOperatorList({ annotationMode: ANNOTATIONS_OFF });
      const [x0, y0, x1, y1] = page.view;
      hidden += countHiddenOnPage(operators, [Math.min(x0, x1), Math.min(y0, y1), Math.max(x0, x1), Math.max(y0, y1)]);
      if (hidden >= MIN_HIDDEN_CHARACTERS) return true;
    }
    return false;
  } catch (error) {
    // The text check still runs. Logged for the developer only, with no CV content.
    console.error("Could not check a CV for hidden text:", String(error?.message || error).slice(0, 200));
    return false;
  }
}

export async function checkCvContent(bytes) {
  // A copy, because PDF.js may take over the bytes, and the caller still needs them for the upload.
  const parser = new PDFParse({ data: bytes.slice() });
  try {
    let text;
    try {
      text = String((await parser.getText())?.text || "");
    } catch {
      return null;
    }

    if (await hasHiddenText(parser)) return HIDDEN_CV_TEXT_ERROR;
    return isBlockedText(text) ? BLOCKED_CV_ERROR : null;
  } finally {
    await parser.destroy();
  }
}
