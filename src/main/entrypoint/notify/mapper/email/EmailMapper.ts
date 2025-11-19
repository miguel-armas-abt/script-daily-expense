import { EmailWrapper } from '../../repository/gmail/wrapper/EmailWrapper';
import { TimeUtil } from '../../../../commons/utils/TimeUtil';

export const EmailMapper = (() => {

  function fromGmailMessageToEmailWrapper(message: GoogleAppsScript.Gmail.GmailMessage): EmailWrapper {
    return new EmailWrapper({
      gmailMessageId: message.getId(),
      date: TimeUtil.fromGmailDateToUtcString(message.getDate()),
      from: message.getFrom(),
      subject: message.getSubject(),
      bodyHtml: message.getBody(),
    })
  }

  return { fromGmailMessageToEmailWrapper };
})();