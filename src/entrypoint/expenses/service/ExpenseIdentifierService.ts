/// <reference types="google-apps-script" />
import { ExpenseRepository } from '../repository/expense/ExpenseRepository';
import { ExpenseBodyMapperHelper } from '../mapper/ExpenseBodyMapperHelper';
import { GmailUtil } from '../utils/GmailUtil';
import { Props } from '../constants/Props';
import { ExpenseDto } from '../dto/ExpenseDto';
import { CategoryExpenseSelectionEmailHelper } from '../helper/CategoryExpenseSelectionEmailHelper';
import { EmailWrapper } from '../repository/gmail/wrapper/EmailWrapper';
import { GmailRepository } from '../repository/gmail/GmailRepository';
import { Properties } from '../config/Properties';
import { TimeUtil } from '../utils/TimeUtil';

export const ExpenseIdentifierService = (() => {

  const reviewedMessageIds = new Set<string>();

  function validateAndInsert(expense: ExpenseDto, email: EmailWrapper) {
    if (reviewedMessageIds.has(expense.gmailMessageId)) return null;

    const alreadyExists = ExpenseRepository.exists(expense.gmailMessageId) === true;
    if (alreadyExists) {
      reviewedMessageIds.add(expense.gmailMessageId);
      return null;
    }

    const gmailMessageId = ExpenseRepository.insert(expense, email.date);

    Logger.log(
      'gmailId=%s | source=%s | amount=%s',
      gmailMessageId,
      expense.source,
      String(expense.amount)
    );
    reviewedMessageIds.add(expense.gmailMessageId);
  }

  function sendEmail(expense: ExpenseDto, email: EmailWrapper) {
    const to = Properties.get(Props.EMAIL_TO_FORWARD);
    const sendEmail = Properties.get(Props.SEND_EMAIL) === 'true';
    if (sendEmail && to) {
      CategoryExpenseSelectionEmailHelper.sendEmail(to, expense, email.date);
    }
  }

  function findConstanciesAndPersist(): void {
    const gmailQueries = GmailUtil.getGmailQueriesSinceLastCheck();
    const lastCheckDateStr = Properties.getOptional(Props.LAST_CHECK_DATE);
    const lastCheckDate = lastCheckDateStr ? new Date(lastCheckDateStr) : null;

    const foundEmails = GmailRepository.findMessagesUntil(gmailQueries, lastCheckDate);

    foundEmails.forEach((email) => {
      const expense = ExpenseBodyMapperHelper.toExpenseDto(email);
      if (!expense || !expense.amount) return;
      validateAndInsert(expense, email);
      sendEmail(expense, email);
    });

    ExpenseRepository.sortByExpenseDateDesc();
    Properties.set(Props.LAST_CHECK_DATE, TimeUtil.now());
  }

  return { findConstanciesAndPersist };
})();
