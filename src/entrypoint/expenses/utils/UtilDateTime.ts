/// <reference types="google-apps-script" />
import { DateConstants } from './../constants/DateConstants';

export const UtilDateTime = (() => {
  function nowCanonical(): string {
    return Utilities.formatDate(new Date(), 'UTC', DateConstants.CANONICAL_ISO_UTC_8601_FORMAT);
  }

  function fromDateToGmailUTC(date: Date): string {
    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(date.getUTCDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  }

  function toCanonicalFromYyyyMmDd(dateText: string): Date {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateText);
    if (!m) throw new Error('Invalid format date. Use YYYY-MM-DD');
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const d = Number(m[3]);
    const baseDate = new Date(y, mo, d, 0, 0, 0, 0);
    const now = new Date();
    baseDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), 0);
    return baseDate;
  }

  return { nowCanonical, fromDateToGmailUTC, toCanonicalFromYyyyMmDd };
})();
