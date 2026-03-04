/**
 * Validates Ghanaian phone numbers.
 * Accepted formats:
 * - +2330542020730
 * - 2330542020730
 * - 0542020730
 */
export const isValidGhanaianPhone = (phone: string): boolean => {
  // Regex: 
  // ^(\+?233|0)  - Matches +233, 233, or 0
  // [235]         - Matches network digit (2 for Vodafone, 3 for AirtelTigo, 5 for MTN)
  // \d{8}$        - Followed by exactly 8 digits
  const ghanaPhoneRegex = /^(\+?233|0)[235]\d{8}$/;
  return ghanaPhoneRegex.test(phone.replace(/\s/g, '')); // Remove spaces before testing
};

export const GHANA_PHONE_ERROR_MESSAGE = "Please enter a valid Ghanaian phone number (e.g., +2330542020730, 2330542020730, or 0542020730).";

/**
 * Converts a valid Ghanaian phone number to E.164 format for Supabase Auth API.
 * E.g., "0542020730" → "+2330542020730"
 *       "2330542020730" → "+2330542020730"
 *       "+2330542020730" → "+2330542020730"
 * Returns the original string if not a valid Ghanaian phone (caller should validate first).
 */
export const toE164 = (phone: string): string => {
  const cleaned = phone.replace(/\s/g, '');
  if (cleaned.startsWith('+233')) return cleaned;
  if (cleaned.startsWith('233')) return '+' + cleaned;
  if (cleaned.startsWith('0')) return '+233' + cleaned.slice(1);
  return cleaned; // fallback
};
