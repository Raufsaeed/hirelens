import tokens from "@/design/tokens.json";

// Shared look for every HireLens email: a short heading, a friendly message and one button.
// Email apps can't read CSS variables, so the colours come from design/tokens.json (the source of truth).

const color = (name) => tokens.color.tokens.find((token) => token.name === name)?.value;

const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

// lines: plain text paragraphs. details: optional [label, value] rows. button: { label, url }.
export function renderEmail({ subject, heading, lines, details = [], button }) {
  const paragraphs = lines.map((line) => `<p style="margin:0 0 12px">${escapeHtml(line)}</p>`).join("");
  const rows = details
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:${color("ink-muted")}">${escapeHtml(label)}</td>` +
        `<td style="padding:6px 0;font-weight:700">${escapeHtml(value)}</td></tr>`
    )
    .join("");
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:${color("surface-page")};font-family:Manrope,Arial,sans-serif;color:${color("ink")}">
<div style="max-width:520px;margin:0 auto;background:${color("surface")};border:1px solid ${color("border")};border-radius:16px;padding:28px">
<p style="margin:0 0 20px;font-weight:800;color:${color("primary")}">HireLens</p>
<h1 style="margin:0 0 16px;font-size:20px;line-height:28px">${escapeHtml(heading)}</h1>
${paragraphs}
${rows ? `<table style="margin:4px 0 16px;border-collapse:collapse;font-size:14px">${rows}</table>` : ""}
<a href="${escapeHtml(button.url)}" style="display:inline-block;margin-top:8px;padding:12px 20px;border-radius:10px;background:${color("primary")};color:${color("on-primary")};font-weight:700;text-decoration:none">${escapeHtml(button.label)}</a>
</div></body></html>`;
  const text = [heading, "", ...lines, ...details.map(([label, value]) => `${label}: ${value}`), "", `${button.label}: ${button.url}`].join("\n");
  return { subject, html, text };
}
