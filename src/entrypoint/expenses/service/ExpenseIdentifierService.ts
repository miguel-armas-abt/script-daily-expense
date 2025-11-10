/// <reference types="google-apps-script" />
import { ExpenseRepository } from '../repository/ExpenseRepository';
import { MapperRegistry } from '../mapper/ExpenseBodyMapperRegistry';
import { ExpenseBodyMapperHelper } from '../mapper/ExpenseBodyMapperHelper';
import { UtilGmail } from '../utils/UtilGmail';
import { UtilLastCheck } from '../utils/UtilLastCheck';
import { AppConstants } from '../constants/AppConstants';
import { ExpenseDto } from './../dto/ExpenseDto';
import { Mailer } from '../repository/Mailer';

const seenMessageIds = new Set<string>();

function isProcessableMessage(message: GoogleAppsScript.Gmail.GmailMessage, lastCheck: Date | null) {
  if (!message) return false;
  const sentAt = message.getDate && message.getDate();
  if (!sentAt) return false;
  if (lastCheck && sentAt <= new Date(lastCheck.getTime() + 1000)) return false;
  return true;
}

function toDtoFromMessage(msg: GoogleAppsScript.Gmail.GmailMessage): ExpenseDto | null {
  const gmailMessageId = msg.getId();
  const expenseDate = (msg.getDate && msg.getDate()) || null;
  const from = (msg.getFrom && msg.getFrom()) || '';
  const subject = (msg.getSubject && msg.getSubject()) || '';
  const bodyHtml = (msg.getBody && msg.getBody()) || '';

  const mappers = MapperRegistry.getAll();
  for (let i = 0; i < mappers.length; i++) {
    const mapper = mappers[i];
    try {
      if (mapper.supports(from, subject)) {
        const expense = mapper.toExpenseDto(bodyHtml);
        ExpenseBodyMapperHelper.completeFields(expense, gmailMessageId, expenseDate, from, subject);
        return expense;
      }
    } catch (e) {
      Logger.log('ExpenseBodyMapper failed: %s | error=%s', (mapper as any)?.supports?.name || 'unknown', e);
    }
  }
  return null;
}

function processMessage(expense: ExpenseDto, emailToForward: string | null) {
  if (seenMessageIds.has(expense.gmailMessageId)) return null;

  const alreadyExists = ExpenseRepository.exists(expense.gmailMessageId) === true;
  if (alreadyExists) {
    seenMessageIds.add(expense.gmailMessageId);
    return null;
  }

  const rowId = ExpenseRepository.insert(expense.toRepositoryPayload() as any);
  Logger.log(
    'gmailId=%s | source=%s | kind=%s | amount=%s',
    expense.gmailMessageId,
    expense.source,
    expense.kind,
    String(expense.amount)
  );
  seenMessageIds.add(expense.gmailMessageId);

  const sendEmail = PropertiesService.getScriptProperties().getProperty(AppConstants.PROP_SEND_EMAIL) === 'true';
  if (sendEmail && emailToForward) {
    Mailer.sendCategorizeMail(emailToForward, {
      gmailMessageId: expense.gmailMessageId,
      amount: expense.amount || '',
      expenseDate: expense.expenseDate || '',
      source: expense.source,
      kind: expense.kind,
      comments: expense.comments
    });
  }

  return rowId;
}

export const ExpenseIdentifierService = (() => {
  function findConstanciesAndPersist(): void {
    const gmailQueries = UtilGmail.getGmailQueriesSinceLastCheck();
    const emailToForward = PropertiesService.getScriptProperties().getProperty(AppConstants.PROP_FORWARD_TO_EMAIL);
    if (!emailToForward) throw new Error('Configure property PROP_FORWARD_TO_EMAIL');
    const lastCheck = UtilLastCheck.getLastCheckCanonical();

    const messagesById = new Map<string, GoogleAppsScript.Gmail.GmailMessage>();
    gmailQueries.forEach((gmailQuery) => {
      const threads = GmailApp.search(gmailQuery, 0, 50);
      threads.forEach((thread) => {
        thread.getMessages().forEach((msg) => {
          if (!isProcessableMessage(msg, lastCheck)) return;
          const messageId = msg.getId();
          const existing = messagesById.get(messageId);
          if (!existing || existing.getDate() < msg.getDate()) {
            messagesById.set(messageId, msg);
          }
        });
      });
    });

    messagesById.forEach((msg) => {
      const expense = toDtoFromMessage(msg);
      if (!expense || !expense.amount) return;
      processMessage(expense, emailToForward);
    });

    ExpenseRepository.sortByExpenseDateDesc();
    UtilLastCheck.setLastCheckCanonical();
  }

  return { findConstanciesAndPersist };
})();
