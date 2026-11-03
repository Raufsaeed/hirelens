// Turns a company name into its public page address: "ABC Tech" -> "abc-tech".
export function slugify(name) {
  const slug = String(name || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // drop accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return slug || "company";
}

// "abc-tech" is taken -> "abc-tech-2", then "abc-tech-3", ...
export function slugWithNumber(base, attempt) {
  return attempt === 0 ? base : `${base}-${attempt + 1}`;
}
