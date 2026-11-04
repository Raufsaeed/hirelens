// Company Settings checks (Feature 06), shared by the form and the server.

export const MAX_ABOUT = 1000;
export const MAX_LOGO_BYTES = 2 * 1024 * 1024;
export const LOGO_ERROR = "Logo must be a PNG or JPG under 2 MB";
export const WEBSITE_ERROR = "Please enter a valid website, for example https://abctech.com";

export function isValidWebsite(value) {
  if (!/^https?:\/\//i.test(value)) return false;
  try {
    const url = new URL(value);
    return url.hostname.includes(".");
  } catch {
    return false;
  }
}

export function validateCompany({ name, about, website }) {
  const errors = {};
  if (!name?.trim()) errors.name = "Company name is required";
  if ((about || "").length > MAX_ABOUT) errors.about = "About us can be up to 1,000 characters";
  if (website?.trim() && !isValidWebsite(website.trim())) errors.website = WEBSITE_ERROR;
  return Object.keys(errors).length ? errors : null;
}

// "png" or "jpg" from the file's first bytes (the name and type can lie), or null.
export function logoKind(bytes) {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  return null;
}

