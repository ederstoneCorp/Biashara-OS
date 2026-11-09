/**
 * Kenyan M-Pesa & Payment Utilities for BiasharaOS
 */

/**
 * Normalizes Kenyan mobile numbers to international format (2547XXXXXXXX or 2541XXXXXXXX).
 */
export function normalizeKenyanPhone(phone: string): string | null {
  const cleaned = phone.replace(/[\s\-\+\(\)]/g, '');
  if (/^254[71]\d{8}$/.test(cleaned)) {
    return cleaned;
  }
  if (/^0[71]\d{8}$/.test(cleaned)) {
    return '254' + cleaned.slice(1);
  }
  if (/^[71]\d{8}$/.test(cleaned)) {
    return '254' + cleaned;
  }
  return null;
}

/**
 * Generates standard Daraja/M-Pesa transaction reference (e.g. QHK82910MA)
 */
export function generateMockDarajaReference(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const prefix = 'QH';
  const randLetter1 = letters[Math.floor(Math.random() * letters.length)];
  const randDigits = Math.floor(100000 + Math.random() * 900000).toString();
  const randLetter2 = letters[Math.floor(Math.random() * letters.length)];
  return `${prefix}${randLetter1}${randDigits}${randLetter2}`;
}

/**
 * Generates official receipt code e.g. REC-2026-0812
 */
export function generateReceiptNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `REC-${year}-${rand}`;
}

/**
 * Generates unique invoice number e.g. INV-2026-0421
 */
export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}-${rand}`;
}
