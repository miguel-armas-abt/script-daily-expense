/// <reference types="google-apps-script" />
import { Properties } from '../../../../commons/config/Properties';
import { Props } from '../../../../commons/constants/Props';
import { Strings } from '../../../../commons/constants/Strings';
import { EmailMapper } from '../../mapper/email/EmailMapper';
import { EmailWrapper } from './wrapper/EmailWrapper';

export const GmailRepository = (() => {

  function sendEmail(to: string, subject: string, htmlBody: string) {
    GmailApp.sendEmail(
      to,
      subject,
      Strings.EMPTY,
      { htmlBody: htmlBody }
    );
  }

  function isCandidateMessage(message: GoogleAppsScript.Gmail.GmailMessage, lastCheck: Date | null) {
    if (!message)
      return false;

    const messageDate = message.getDate();
    if (!messageDate)
      return false;

    if (lastCheck) {
      const marginMs = 1000;
      const threshold = new Date(lastCheck.getTime() + marginMs);
      const isNewerThanLastCheck = messageDate > threshold;
      return isNewerThanLastCheck;
    }

    return true;
  }

  function hasNewerOrEqualReviewedMessage(
    message: GoogleAppsScript.Gmail.GmailMessage,
    reviewedMessageMap: Map<string, GoogleAppsScript.Gmail.GmailMessage>): boolean {

    const messageId = message.getId();
    const reviewedMessage = reviewedMessageMap.get(messageId);
    return (reviewedMessage && (reviewedMessage.getDate() >= message.getDate())) === true;
  }

  function findMessagesSinceLastCheck(gmailQueries: string[], lastCheck: Date | null): Set<EmailWrapper> {
    const reviewedMessageMap = new Map<string, GoogleAppsScript.Gmail.GmailMessage>();
    const pageSize = Number(Properties.get(Props.GMAIL_PAGE_SIZE));

    gmailQueries.forEach((gmailQuery) => {
      let start = 0;

      while (true) {
        const threads = GmailApp.search(gmailQuery, start, pageSize);
        if (!threads || threads.length === 0) {
          break;
        }

        threads.forEach((thread) => {
          thread.getMessages().forEach((message) => {
            if (!isCandidateMessage(message, lastCheck)) {
              return;
            }

            if (!hasNewerOrEqualReviewedMessage(message, reviewedMessageMap)) {
              reviewedMessageMap.set(message.getId(), message);
            }
          });
        });

        if (threads.length < pageSize) {
          break;
        }

        start += pageSize;
      }
    });

    const messageSet = new Set<EmailWrapper>();
    reviewedMessageMap.forEach((msg) => {
      const email = EmailMapper.fromGmailMessageToEmailWrapper(msg);
      messageSet.add(email);
    });

    return messageSet;
  }

  return {
    sendEmail,
    findMessagesSinceLastCheck: findMessagesSinceLastCheck
  };
})();
