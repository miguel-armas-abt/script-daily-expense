/// <reference types="google-apps-script" />
import { ExpenseRepository } from '../../../commons/repository/expense/ExpenseRepository';
import { ExpenseHtmlMapper } from '../mapper/html/ExpenseHtmlMapper';
import { GmailUtil } from '../utils/GmailUtil';
import { Props } from '../../../commons/constants/Props';
import { ExpenseEntity } from '../../../commons/repository/expense/entity/ExpenseEntity';
import { ExpenseNotifierService } from './ExpenseNotifierService';
import { EmailWrapper } from '../repository/gmail/wrapper/EmailWrapper';
import { GmailRepository } from '../repository/gmail/GmailRepository';
import { Properties } from '../../../commons/config/Properties';
import { TimeUtil } from '../../../commons/utils/TimeUtil';

const ExpenseFillerService = (() => {

  const existingIds = new Set<string>();

  function validateAndInsert(expense: ExpenseEntity): void {
    if(!expense.gmailMessageId) 
      throw new Error('[fill][service] The field is required: gmailMessageId')

    if (existingIds.has(expense.gmailMessageId))
      return;

    const alreadyExists = ExpenseRepository.exists(expense.gmailMessageId) === true;
    if (alreadyExists) {
      existingIds.add(expense.gmailMessageId);
      return;
    }

    const gmailMessageId = ExpenseRepository.insert(expense);
    existingIds.add(expense.gmailMessageId);

    Logger.log('gmailId=%s | source=%s | amount=%s', gmailMessageId, expense.source, String(expense.amount));
  }

  function sendEmail(expense: ExpenseEntity, email: EmailWrapper) {
    const to = Properties.get(Props.EMAIL_TO);
    const sendEmail = Properties.get(Props.SEND_EMAIL) === 'true';
    if (sendEmail && to) {
      ExpenseNotifierService.sendEmail(to, expense);
    }
  }

  function fillConstanciesAndNotify(): void {
    const lastCheckDate = TimeUtil.getLastCheckDateUtc();
    const gmailQueries = GmailUtil.getGmailQueriesSinceLastCheck(lastCheckDate);
    const foundEmails = GmailRepository.findMessagesSinceLastCheck(gmailQueries, lastCheckDate);

    foundEmails.forEach((email) => {
      const expense = ExpenseHtmlMapper.toEntity(email);
      if (!expense || !expense.amount) return;
      validateAndInsert(expense);
      sendEmail(expense, email);
    });

    ExpenseRepository.sortByExpenseDateDesc();
    Properties.set(Props.LAST_CHECK_DATE, TimeUtil.nowUtcString());
  }

  return { fillConstanciesAndNotify: fillConstanciesAndNotify };
})();

export default ExpenseFillerService;