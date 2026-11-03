// The password rule used by every form that sets a password (Sign up, Reset, Settings).

export const PASSWORD_ERROR =
  "Password must be at least 8 characters and include one capital letter and one special character (like @)";

export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (value) => value.length >= 8 },
  { id: "capital", label: "One capital letter (A–Z)", test: (value) => /[A-Z]/.test(value) },
  {
    id: "special",
    label: "One special character (like @)",
    // Anything that is not a letter, number or space, such as @ # $ !
    test: (value) => /[^A-Za-z0-9\s]/.test(value),
  },
];

export function isStrongPassword(value) {
  return PASSWORD_RULES.every((rule) => rule.test(value || ""));
}
