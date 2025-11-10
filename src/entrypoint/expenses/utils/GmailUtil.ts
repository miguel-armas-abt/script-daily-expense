import { Properties } from '../config/Properties';
import { Props } from '../constants/Props';
import { Strings } from '../constants/Strings';
import { TimeUtil } from './TimeUtil';
import { GmailConstants } from '../constants/GmailConstants';

export const GmailUtil = (() => {

  function getGmailQueriesSinceLastCheck(): string[] {
    const lastCheckDateStr = Properties.getOptional(Props.LAST_CHECK_DATE);
    const lastCheckDate = lastCheckDateStr ? new Date(lastCheckDateStr) : null;

    let afterPart = Strings.EMPTY;
    if (lastCheckDate) afterPart = ' after:' + TimeUtil.fromDateToGmailUTC(lastCheckDate);
    return GmailConstants.GMAIL_QUERIES.map((q) => q + afterPart);
  }

  return { getGmailQueriesSinceLastCheck };
})();
