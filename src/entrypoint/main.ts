/// <reference types="google-apps-script" />
import { TriggerService } from './TriggerService';
import { ExpenseIdentifierService } from './expenses/service/ExpenseIdentifierService';
import { Mailer } from './expenses/repository/Mailer';
import { ExpenseRepository } from './expenses/repository/ExpenseRepository';
import { AppConstants } from './expenses/constants/AppConstants';
import { UtilDateTime } from './expenses/utils/UtilDateTime';

declare const global: any; // Compatibilidad

// === WebApp (doGet) y endpoints ===
function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.HTML.HtmlOutput {
  const params = (e && e.parameter) || ({} as Record<string, string>);
  const action = params.action || 'edit';

  if (action === 'edit') {
    const template = HtmlService.createTemplateFromFile('WebAppUpdateExpenseTemplate');
    template.gmailMessageId = params.gmailMessageId || '';
    template.amount = params.amount || '';
    template.expenseDate = params.expenseDate || '';
    template.source = params.source || '';
    template.kind = params.kind || '';
    template.categories = AppConstants.DEFAULT_CATEGORIES;
    template.comments = params.comments || '';
    return template.evaluate().setTitle('Categorizar gasto');
  }

  if (action === 'new') {
    const templateNew = HtmlService.createTemplateFromFile('WebAppSaveExpenseTemplate');
    templateNew.categories = AppConstants.DEFAULT_CATEGORIES;
    const tz = Session.getScriptTimeZone() || 'America/Lima';
    templateNew.defaultDate = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
    return templateNew.evaluate().setTitle('Registrar nuevo gasto');
  }

  const html = HtmlService.createHtmlOutput('<div class="err">Acción no soportada.</div>');
  return html.setTitle('Error');
}

function saveExpenseCategory(payload: {
  gmailMessageId: string;
  category: string;
  comments?: string;
  amount?: string | number;
}): boolean {
  const gmailMessageId = (payload && payload.gmailMessageId) ? String(payload.gmailMessageId).trim() : '';
  const category = (payload && payload.category) ? String(payload.category).trim() : '';
  const comments = (payload && payload.comments != null) ? String(payload.comments).trim() : '';
  const amountRaw = (payload && payload.amount != null) ? String(payload.amount).trim() : '';

  if (!gmailMessageId) throw new Error('gmailMessageId is required');
  if (!category) throw new Error('category is required');

  const amountNumber = Number(amountRaw);
  if (amountRaw && Number.isNaN(amountNumber)) throw new Error('Invalid amount');

  const isUpdated = ExpenseRepository.updateByGmailMessageId(gmailMessageId, category, comments, Number(amountNumber));
  if (!isUpdated) throw new Error('gmailMessageId not found: ' + gmailMessageId);
  return true;
}

function saveNewExpense(payload: {
  amount: string;
  category: string;
  comments?: string;
  kind?: string;
  expenseDate: string;
}): string {
  const amountRaw = (payload && payload.amount != null) ? String(payload.amount).trim() : '';
  const category = (payload && payload.category) ? String(payload.category).trim() : '';
  const comments = (payload && payload.comments != null) ? String(payload.comments).trim() : '';
  const kind = (payload && payload.kind != null) ? String(payload.kind).trim() : '';
  const dateStr = (payload && payload.expenseDate != null) ? String(payload.expenseDate).trim() : '';

  if (!amountRaw) throw new Error('amount is required');
  if (!category) throw new Error('category is required');
  if (!dateStr) throw new Error('expenseDate is required');

  const amountNum = Number(amountRaw);
  if (Number.isNaN(amountNum)) throw new Error('Invalid amount');

  const expenseDate = UtilDateTime.toCanonicalFromYyyyMmDd(dateStr);

  const expense = {
    gmailMessageId: Utilities.getUuid(),
    from: AppConstants.MANUALLY,
    subject: AppConstants.MANUALLY,
    source: AppConstants.MANUALLY,
    kind: kind || AppConstants.MANUALLY,
    currency: AppConstants.CURRENCY_PEN,
    amount: amountNum,
    category,
    comments,
    expenseDate
  };

  const id = ExpenseRepository.insert(expense as any);
  if (!id) throw new Error('The expense could not be recorded.');
  ExpenseRepository.sortByExpenseDateDesc();
  return id;
}

// === Helpers / Jobs ===
function setup(): void {
  TriggerService.createTimeTriggerEveryMinutes('runExpenseIngestion');
}
function runExpenseIngestion(): void {
  ExpenseIdentifierService.findConstanciesAndPersist();
}
function testMail(): void {
  Mailer.sendCategorizeMail('miguel.armas.abt@gmail.com', {
    gmailMessageId: 'a8e2ecd0-f4d8-4feb-8e7d-95229435359b',
    amount: 9.5,
    expenseDate: '27/10/2025 19:28:27',
    source: 'BBVA',
    kind: 'PLIN',
    comments: 'Hugo W Castro D'
  });
}
function sortSheet(): void {
  ExpenseRepository.sortByExpenseDateDesc();
}
function lastCheckDate(): void {
  // Setea el timestamp (si quieres usarlo manualmente)
  PropertiesService.getScriptProperties().setProperty(
    AppConstants.PROP_LAST_CHECK_TIMESTAMP_ISO_UTC,
    UtilDateTime.nowCanonical()
  );
}
function generateUUID(): void {
  const uuid = Utilities.getUuid();
  Logger.log(uuid);
}

// === Expone en global (GAS necesita funciones globales) ===
(globalThis as any).doGet = doGet;
(globalThis as any).saveExpenseCategory = saveExpenseCategory;
(globalThis as any).saveNewExpense = saveNewExpense;
(globalThis as any).setup = setup;
(globalThis as any).runExpenseIngestion = runExpenseIngestion;
(globalThis as any).testMail = testMail;
(globalThis as any).sortSheet = sortSheet;
(globalThis as any).lastCheckDate = lastCheckDate;
(globalThis as any).generateUUID = generateUUID;
