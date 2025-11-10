import { AppConstants } from './../constants/AppConstants';
import { UtilLastCheck } from './UtilLastCheck';
import { UtilDateTime } from './UtilDateTime';

export const UtilGmail = (() => {
  function getGmailQueriesSinceLastCheck(): string[] {
    const lastCheck = UtilLastCheck.getLastCheckCanonical();
    let afterPart = '';
    if (lastCheck) afterPart = ' after:' + UtilDateTime.fromDateToGmailUTC(lastCheck);
    return AppConstants.GMAIL_QUERIES.map((q) => q + afterPart);
  }
  return { getGmailQueriesSinceLastCheck };
})();
