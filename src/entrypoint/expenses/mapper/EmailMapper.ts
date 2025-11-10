import { Strings } from '../constants/Strings';
import { EmailWrapper } from '../repository/gmail/wrapper/EmailWrapper';

export const EmailMapper = (() => {

  function fromGmailMessageToEmailWrapper(message: GoogleAppsScript.Gmail.GmailMessage): EmailWrapper {
    return new EmailWrapper({
      gmailMessageId: message.getId(),
      date: new Date(message.getDate().getTime()),
      from: (message.getFrom && message.getFrom()) || Strings.EMPTY,
      subject: (message.getSubject && message.getSubject()) || Strings.EMPTY,
      bodyHtml: (message.getBody && message.getBody()) || Strings.EMPTY,
    })
  }

  return { fromGmailMessageToEmailWrapper };
})();