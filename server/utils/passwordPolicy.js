// Server-side mirror of the client's password strength rule (client/src/utils/validators.js).
// Enforced here too since a request can bypass the browser form entirely.

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
function isStrongPassword(value) {
  const trimmed = String(value || "").trim();
  if (trimmed.length < 6) return false;
  if (COMMON_WEAK_PASSWORDS.has(trimmed.toLowerCase())) return false;
  if (isRepeatedChar(trimmed)) return false;
  if (isSequentialDigits(trimmed)) return false;
  if (!/[A-Za-z]/.test(trimmed) || !/[0-9]/.test(trimmed)) return false;
  return true;
}

module.exports = { isStrongPassword };
