// True for a well-formed id like "3f2b...-...". Checked before a database query, so a broken URL
// shows "not found" instead of a database error.
export function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value || ""));
}
