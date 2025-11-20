import { Currency, CurrencyParser } from '../../../../../commons/constants/Currency';
import { Strings } from '../../../../../commons/constants/Strings';
import { ExpenseEntity } from '../../../../../commons/repository/expense/entity/ExpenseEntity';
import { BBVAPatterns } from '../../../constants/BBVA';
import type { IExpenseHtmlMapper } from '../IExpenseHtmlMapper';

export const BBVABusinessQRHtml = Object.freeze({

  SUBJECT_REGEX: /pago a comercios con QR/i,
  AMOUNT_AND_CURRENCY_REGEX: /(S\/|\$)\s*([0-9]+(?:[.,][0-9]{2})?)/i,
  RECIPIENT_REGEX: /Comercio(?:\s|&nbsp;)*<\/p>\s*<p[^>]*>\s*([^<]+)/i,

  HTML_NBSP: /&nbsp;|&#160;/gi,
  MULTIPLE_SPACES: /\s+/g,

} as const);

function getAmountAndCurrency(html: string): {
  amount: number;
  currency: Currency;
  matchEndIndex: number;
} {
  let match = html.match(BBVABusinessQRHtml.AMOUNT_AND_CURRENCY_REGEX);

  if (!match || match.index == null) {
    throw new Error('[bbva-business-qr][mapper] Field not matched: amount & currency');
  }

  const currencySymbol = match[1];
  const amountNumber = Number(match[2]);
  const currencyCode = CurrencyParser.parseFromSymbol(currencySymbol);

  const matchEndIndex = match.index + match[0].length;

  return {
    amount: amountNumber,
    currency: currencyCode,
    matchEndIndex,
  };
}

function getMerchantName(html: string): string {
  const merchantMatch = html.match(BBVABusinessQRHtml.RECIPIENT_REGEX);
  if (!merchantMatch)
    return Strings.EMPTY;

  const rawMerchantName = merchantMatch[1];

  const normalizedMerchantName = rawMerchantName
    .replace(BBVABusinessQRHtml.HTML_NBSP, Strings.SPACE)
    .replace(BBVABusinessQRHtml.MULTIPLE_SPACES, Strings.SPACE)
    .trim();

  return normalizedMerchantName;
}

export const BBVABusinessQRMapper: IExpenseHtmlMapper = {

  supports(from: string, subject: string): boolean {
    return BBVAPatterns.FROM_BBVA_PROCESSES_REGEX.test(from) &&
     BBVABusinessQRHtml.SUBJECT_REGEX.test(subject);
  },

  toEntity(bodyHtml: string): ExpenseEntity {
    const { amount, currency } = getAmountAndCurrency(bodyHtml);
    const merchantName = getMerchantName(bodyHtml);

    const expense = new ExpenseEntity();
    expense.amount = amount;
    expense.currency = currency;
    expense.source = 'BBVA - COMERCIO QR';
    expense.comments = merchantName;
    return expense;
  }
};
