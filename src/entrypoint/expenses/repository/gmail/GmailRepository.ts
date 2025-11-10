/// <reference types="google-apps-script" />
import { Strings } from '../../constants/Strings';
import { EmailMapper } from '../../mapper/EmailMapper';
import { EmailWrapper } from './wrapper/EmailWrapper';

export const GmailRepository = (() => {

  function sendEmail(to: string, subject: string, htmlBody: string) {
    GmailApp.sendEmail(
      to,
      subject,
      Strings.EMPTY,
      { htmlBody: htmlBody}
    );
  }

  function isCandidateMessage(message: GoogleAppsScript.Gmail.GmailMessage, cutOffDate: Date | null) {
    if (!message) return false;
    const messageDate = message.getDate && message.getDate();
    if (!messageDate) return false;
    if (cutOffDate && messageDate <= new Date(cutOffDate.getTime() + 1000)) return false;
    return true;
  }

  function wasReviewed(message: GoogleAppsScript.Gmail.GmailMessage,
                      reviewedMessageMap: Map<string, GoogleAppsScript.Gmail.GmailMessage>) {
    const messageId = message.getId();
    const reviewedMessage = reviewedMessageMap.get(messageId);
    return reviewedMessage && reviewedMessage.getDate() >= message.getDate();
  }

  function findMessagesUntil(gmailQueries : string[], cutOffDate: Date | null) : Set<EmailWrapper> {
    const reviewedMessageMap = new Map<string, GoogleAppsScript.Gmail.GmailMessage>();
    gmailQueries
    .forEach((gmailQuery) => {
      GmailApp.search(gmailQuery)
      // GmailApp.search(gmailQuery, 0, 50)
      .forEach((thread) => {
        thread.getMessages()
        .forEach((msg) => {
          if (!isCandidateMessage(msg, cutOffDate)) return;
          if (!wasReviewed(msg, reviewedMessageMap)) reviewedMessageMap.set(msg.getId(), msg);
        })
      })
    });

    const messageSet = new Set<EmailWrapper>();
    reviewedMessageMap.forEach((msg) => {
      const email = EmailMapper.fromGmailMessageToEmailWrapper(msg);
      messageSet.add(email);
    })
    return messageSet;
  }

  return { sendEmail, findMessagesUntil};
})();
