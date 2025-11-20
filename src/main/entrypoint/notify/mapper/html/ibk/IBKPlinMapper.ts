import { ExpenseEntity } from '../../../../../commons/repository/expense/entity/ExpenseEntity';
import type { IExpenseHtmlMapper } from '../IExpenseHtmlMapper';
import { Strings } from '../../../../../commons/constants/Strings';
import { Currency, CurrencyParser } from '../../../../../commons/constants/Currency';
import { IBKPatterns } from '../../../constants/IBK';

export const IBKPlinHtml = Object.freeze({

  AMOUNT_AND_CURRENCY_KEY_REGEX: /Moneda\s*y\s*monto\s*:?/i,
  AMOUNT_AND_CURRENCY_REGEX: /(S\/|\$)(?:\s|&nbsp;|&#160;|<[^>]*>)*([0-9]+(?:[.,][0-9]{2})?)/i,
  RECIPIENT_REGEX: /Destinatario\s*:?/i,

  END_TABLE_ROW: /<\/tr>/i,
  TABLE_CELL_VALUE: /<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i,
  HTML_TAGS: /<[^>]+>/g,
  HTML_NBSP: /&nbsp;|&#160;/gi,
  MULTIPLE_SPACES: /\s+/g,

} as const)

function getTableRowSliceByKey(html: string, keyPattern: RegExp): string {
  const keyIndex = html.search(keyPattern);
  if (keyIndex < 0) {
    throw new Error(`[ibk-plin][mapper] Key not found for pattern: ${keyPattern}`);
  }

  let rowSlice = html.slice(keyIndex);
  const rowEndIndex = rowSlice.search(IBKPlinHtml.END_TABLE_ROW);
  if (rowEndIndex > 0) {
    rowSlice = rowSlice.slice(0, rowEndIndex);
  }

  return rowSlice;
}

function getAmountAndCurrency(html: string): { amount: number; currency: Currency } {
  const amountRowHtml = getTableRowSliceByKey(html, IBKPlinHtml.AMOUNT_AND_CURRENCY_KEY_REGEX);

  const match = amountRowHtml.match(IBKPlinHtml.AMOUNT_AND_CURRENCY_REGEX);
  if (!match) {
    throw new Error('[ibk-plin][mapper] Field not matched: amount & currency');
  }

  const currencySymbol = match[1];
  const amountNumber = Number(match[2]);
  const currencyCode = CurrencyParser.parseFromSymbol(currencySymbol);

  return {
    amount: amountNumber,
    currency: currencyCode,
  };
}

function getRecipient(html: string): string {
  const recipientRowHtml = getTableRowSliceByKey(html, IBKPlinHtml.RECIPIENT_REGEX);

  const recipientMatch = recipientRowHtml.match(IBKPlinHtml.TABLE_CELL_VALUE);
  if (!recipientMatch)
    return Strings.EMPTY;

  const rawRecipient = recipientMatch[1];

  const normalizedRecipient = rawRecipient
    .replace(IBKPlinHtml.HTML_TAGS, Strings.SPACE)
    .replace(IBKPlinHtml.HTML_NBSP, Strings.SPACE)
    .replace(IBKPlinHtml.MULTIPLE_SPACES, Strings.SPACE)
    .trim();

  return normalizedRecipient;
}

export const IBKPlinMapper: IExpenseHtmlMapper = {

  supports(from: string, subject: string): boolean {
    return IBKPatterns.FROM_IBK_CUSTOMER_SERVICE_REGEX.test(from) &&
      IBKPatterns.SUBJECT_PLIN_REGEX.test(subject);
  },

  toEntity(bodyHtml: string): ExpenseEntity {
    const {amount, currency} = getAmountAndCurrency(bodyHtml);
    const recipient = getRecipient(bodyHtml);

    let expense = new ExpenseEntity();
    expense.amount = amount;
    expense.currency = currency;
    expense.source = 'INTERBANK - PLIN';
    expense.comments = recipient || Strings.EMPTY;
    return expense;
  }
};
