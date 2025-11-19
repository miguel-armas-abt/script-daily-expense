/// <reference types="google-apps-script" />
import { Properties } from '../config/Properties';
import { DateConstants } from '../constants/DateConstants';
import { Props } from '../constants/Props';

export const TimeUtil = (() => {

  function getLastCheckDateUtc(): Date | null {
    const lastCheckDateStr = Properties.getOptional(Props.LAST_CHECK_DATE);
    return lastCheckDateStr ? new Date(lastCheckDateStr) : null;
  }

  function toDateFromUtc(utcString: string): Date {
    return new Date(utcString);
  }

  function toUtcString(date: Date): string {
    return Utilities.formatDate(date, DateConstants.UTC, DateConstants.ISO_UTC_8601_FORMAT);
  }

  function nowUtcString(): string {
    return toUtcString(new Date());
  }

  function toGmailDateString(utcDate: Date): string {
    const yyyy = utcDate.getUTCFullYear();
    const mm = String(utcDate.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(utcDate.getUTCDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  }

  function fromGmailDateToUtcString(date: GoogleAppsScript.Base.Date) {
    return Utilities.formatDate(date, DateConstants.UTC, DateConstants.ISO_UTC_8601_FORMAT);
  }

  function toTimeZoneString(utcString: string | Date): string {
    return Utilities.formatDate(new Date(utcString), DateConstants.TIME_ZONE, DateConstants.TIME_ZONE_FORMAT);
  }

  return {
    getLastCheckDateUtc,
    toDateFromUtc,
    toUtcString,
    nowUtcString,
    toGmailDateString,
    fromGmailDateToUtcString,
    toTimeZoneString
  };
})();
