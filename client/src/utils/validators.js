// Shared form-field validators used across Login, Signup, and Checkout.

export const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

// Letters (English + Urdu/Arabic script), spaces, apostrophes, and hyphens only.
// Blocks digits and symbols like "1223" or "@#$%" in name/city fields.
const ALPHA_TEXT_REGEX = /^[A-Za-z؀-ۿ][A-Za-z؀-ۿ\s'-]{1,49}$/;

export function isValidEmail(value) {
  return EMAIL_REGEX.test(value.trim());
}

// For fields that should only contain a person/place name (e.g. Full Name, City).
export function isAlphaText(value) {
  return ALPHA_TEXT_REGEX.test(value.trim());
}

// Accepts digits with optional leading "+" and spaces/dashes as separators,
// then checks the actual digit count is a plausible phone length.
export function isValidPhone(value) {
  const trimmed = value.trim();
  if (!/^\+?[0-9\s-]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

// Well-known weak passwords people reach for first — blocked outright.
const COMMON_WEAK_PASSWORDS = new Set([
  "123456", "1234567", "12345678", "123456789", "1234567890",
  "111111", "000000", "121212", "123123",
  "password", "qwerty", "abc123", "letmein", "iloveyou", "admin123",
]);

const ASCENDING_DIGITS = "0123456789";
const DESCENDING_DIGITS = "9876543210";

// "111111", "000000", "aaaaaa" — the same character repeated end to end.
function isRepeatedChar(value) {
  return /^(.)\1+$/.test(value);
}

// "123456", "654321" — a straight run of ascending/descending digits.
function isSequentialDigits(value) {
  return /^\d+$/.test(value) && (ASCENDING_DIGITS.includes(value) || DESCENDING_DIGITS.includes(value));
}

// Rejects easy/common passwords: must be 6+ chars, mix letters and numbers,
// and not be a known weak, repeated, or sequential pattern.
export function isStrongPassword(value) {
  const trimmed = value.trim();
  if (trimmed.length < 6) return false;
  if (COMMON_WEAK_PASSWORDS.has(trimmed.toLowerCase())) return false;
  if (isRepeatedChar(trimmed)) return false;
  if (isSequentialDigits(trimmed)) return false;
  if (!/[A-Za-z]/.test(trimmed) || !/[0-9]/.test(trimmed)) return false;
  return true;
}
