import { Strings } from '../../../commons/constants/Strings';
import { TimeUtil } from '../../../commons/utils/TimeUtil';
import { GmailConstants } from '../constants/GmailConstants';

export const GmailUtil = (() => {

  function getGmailQueriesSinceLastCheck(lastCheckDate: Date | null): string[] {
    let afterPart = Strings.EMPTY;
    if (lastCheckDate) {
      afterPart = ' after:' + TimeUtil.toGmailDateString(lastCheckDate);
    }
    return GmailConstants.GMAIL_QUERIES.map((q) => q + afterPart);
  }

  return { getGmailQueriesSinceLastCheck };
})();
