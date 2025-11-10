/// <reference types="google-apps-script" />
import { DateConstants } from '../constants/DateConstants';

export const TimeUtil = (() => {

  function toString(date: Date) {
    return Utilities.formatDate(date, 'UTC', DateConstants.CANONICAL_ISO_UTC_8601_FORMAT);
  }

  function now(): string {
    return toString(new Date());
  }

  function fromDateToGmailUTC(date: Date): string {
    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(date.getUTCDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  }

  return {
    toString: toString,
    now: now,
    fromDateToGmailUTC,
  };
})();
