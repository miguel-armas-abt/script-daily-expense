import { ExpenseEntity } from '../../../../../commons/repository/expense/entity/ExpenseEntity';
import type { IExpenseHtmlMapper } from '../IExpenseHtmlMapper';
import { Currency, CurrencyParser } from '../../../../../commons/constants/Currency';
import { Strings } from '../../../../../commons/constants/Strings';
import { BBVAPatterns } from '../../../constants/BBVA';

export const BBVADebitCardHtml = Object.freeze({

  SUBJECT_REGEX: /Has realizado.*consumo.*tarjeta\s*BBVA/i,
  AMOUNT_REGEX: /Monto:\s*<\/p>\s*<p[^>]*>\s*([0-9]+(?:[.,][0-9]{2})?)/i,
  CURRENCY_REGEX: /Moneda:\s*<\/p>\s*<p[^>]*>\s*([A-Z]{3}|S\/|US\$)/i,
  RECIPIENT_REGEX_P: /Comercio\s*:?\s*<\/p>\s*<p[^>]*>\s*([^<]+)/i,
  RECIPIENT_REGEX_TD: /Comercio\s*:?\s*<\/td>\s*<td[^>]*>\s*([^<]+)/i,

  HTML_NBSP: /&nbsp;|&#160;/gi,
  MULTIPLE_SPACES: /\s+/g,

} as const);

function getAmount(html: string): number {
  const match = html.match(BBVADebitCardHtml.AMOUNT_REGEX);

  if (!match) {
    throw new Error('[bbva-debit-card][mapper] Field not matched: amount');
  }

  const amountNumber = Number(match[1]);
  return amountNumber;
}

function getCurrency(html: string): Currency {
  const match = html.match(BBVADebitCardHtml.CURRENCY_REGEX);

  if (!match) {
    throw new Error('[bbva-debit-card][mapper] Field not matched: currency');
  }

  const currencyCode = match[1].toUpperCase();
  return CurrencyParser.parseFromCode(currencyCode);
}

function getMerchantName(html: string): string {
  const merchantMatch =
    html.match(BBVADebitCardHtml.RECIPIENT_REGEX_P) ||
    html.match(BBVADebitCardHtml.RECIPIENT_REGEX_TD);

  if (!merchantMatch)
    return Strings.EMPTY;

  const rawMerchantName = merchantMatch[1];

  const normalizedMerchantName = rawMerchantName
    .replace(BBVADebitCardHtml.HTML_NBSP, Strings.SPACE)
    .replace(BBVADebitCardHtml.MULTIPLE_SPACES, Strings.SPACE)
    .trim();

  return normalizedMerchantName;
}

export const BBVADebitCardMapper: IExpenseHtmlMapper = {

  supports(from: string, subject: string): boolean {
    return BBVAPatterns.FROM_BBVA_PROCESSES_REGEX.test(from) &&
      BBVADebitCardHtml.SUBJECT_REGEX.test(subject);
  },

  toEntity(bodyHtml: string): ExpenseEntity {
    const amount = getAmount(bodyHtml);
    const currency = getCurrency(bodyHtml);
    const merchantName = getMerchantName(bodyHtml);

    const expense = new ExpenseEntity();
    expense.amount = amount;
    expense.currency = currency;
    expense.source = 'BBVA - CONSUMO DE TARJETA DEBITO';
    expense.comments = merchantName;
    return expense;
  }
};
