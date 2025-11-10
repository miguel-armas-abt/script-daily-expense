/// <reference types="google-apps-script" />
import { ExpenseRepository } from '../repository/expense/ExpenseRepository';
import { WebAppOptions } from '../constants/WebAppOptions';
import { Strings } from '../constants/Strings';
import { ExpenseDto } from '../dto/ExpenseDto';
import { CurrencyConstants } from '../enums/Currency';

// === WebApp (doGet) y endpoints ===
function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.HTML.HtmlOutput {
  const params = (e && e.parameter) || ({} as Record<string, string>);
  const action = params.action || 'edit';

  if (action === 'edit') {
    const template = HtmlService.createTemplateFromFile('WebAppUpdateExpenseTemplate');
    template.gmailMessageId = params.gmailMessageId || '';
    template.amount = params.amount || Strings.EMPTY;
    template.expenseDate = params.expenseDate || Strings.EMPTY;
    template.source = params.source || Strings.EMPTY;
    template.kind = params.kind || Strings.EMPTY;
    template.categories = WebAppOptions.DEFAULT_CATEGORIES;
    template.comments = params.comments || Strings.EMPTY;
    return template.evaluate().setTitle('Categorizar gasto');
  }

  if (action === 'new') {
    const templateNew = HtmlService.createTemplateFromFile('WebAppSaveExpenseTemplate');
    templateNew.categories = WebAppOptions.DEFAULT_CATEGORIES;
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
  source?: string;
  expenseDate: string;
}): string {

  const amountRaw = (payload && payload.amount != null) ? String(payload.amount).trim() : '';
  const category = (payload && payload.category) ? String(payload.category).trim() : '';
  const comments = (payload && payload.comments != null) ? String(payload.comments).trim() : '';
  const dateStr = (payload && payload.expenseDate != null) ? String(payload.expenseDate).trim() : '';

  if (!amountRaw) throw new Error('amount is required');
  if (!category) throw new Error('category is required');
  if (!dateStr) throw new Error('expenseDate is required');

  const amountNum = Number(amountRaw);
  if (Number.isNaN(amountNum)) throw new Error('Invalid amount');

  const expense = new ExpenseDto({
        gmailMessageId: Utilities.getUuid(),
        source: WebAppOptions.MANUALLY,
        amount: amountNum,
        currency: CurrencyConstants.CURRENCY_PEN,
        comments,
        category
  });

  const id = ExpenseRepository.insert(expense, new Date());
  if (!id) throw new Error('The expense could not be recorded.');
  ExpenseRepository.sortByExpenseDateDesc();
  return id;
}

// === Expone en global (GAS necesita funciones globales) ===
(globalThis as any).doGet = doGet;
(globalThis as any).saveExpenseCategory = saveExpenseCategory;
(globalThis as any).saveNewExpense = saveNewExpense;
