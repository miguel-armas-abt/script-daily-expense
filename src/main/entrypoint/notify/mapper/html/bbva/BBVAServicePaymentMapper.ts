import { Currency, CurrencyParser } from '../../../../../commons/constants/Currency';
import { Strings } from '../../../../../commons/constants/Strings';
import { ExpenseEntity } from '../../../../../commons/repository/expense/entity/ExpenseEntity';
import { BBVAPatterns } from '../../../constants/BBVA';
import type { IExpenseHtmlMapper } from '../IExpenseHtmlMapper';

export const BBVAServicePaymentHtml = Object.freeze({

  SUBJECT_REGEX: /Constancia Pago de servicios/i,
  AMOUNT_AND_CURRENCY_REGEX: /(S\/|\$)\s*([0-9]+(?:[.,][0-9]{2})?)/i,
  RECIPIENT_REGEX: /Nombre\s+(?:de\s+)?servicio<\/p>\s*<p[^>]*>\s*([^<]+)/i,

  HTML_NBSP: /&nbsp;|&#160;/gi,
  MULTIPLE_SPACES: /\s+/g,

} as const);

function getAmountAndCurrency(html: string): {
  amount: number;
  currency: Currency;
} {
  let match = html.match(BBVAServicePaymentHtml.AMOUNT_AND_CURRENCY_REGEX);

  if (!match || match.index == null) {
    throw new Error('[bbva-service][mapper] Field not matched: amount & currency');
  }

  const currencySymbol = match[1];
  const amountNumber = Number(match[2]);
  const currencyCode = CurrencyParser.parseFromSymbol(currencySymbol);

  return {
    amount: amountNumber,
    currency: currencyCode,
  };
}

function getServiceName(html: string): string {
  const serviceNameMatch = html.match(BBVAServicePaymentHtml.RECIPIENT_REGEX);
  if (!serviceNameMatch) {
    return Strings.EMPTY;
  }

  const rawServiceName = serviceNameMatch[1];

  const normalizedServiceName = rawServiceName
    .replace(BBVAServicePaymentHtml.HTML_NBSP, Strings.SPACE)
    .replace(BBVAServicePaymentHtml.MULTIPLE_SPACES, Strings.SPACE)
    .trim();

  return normalizedServiceName;
}

export const BBVAServicePaymentMapper: IExpenseHtmlMapper = {

  supports(from: string, subject: string): boolean {
    return BBVAPatterns.FROM_BBVA_PROCESSES_REGEX.test(from) &&
      BBVAServicePaymentHtml.SUBJECT_REGEX.test(subject);
  },

  toEntity(bodyHtml: string): ExpenseEntity {
    const { amount, currency } = getAmountAndCurrency(bodyHtml);
    const serviceName = getServiceName(bodyHtml);

    const expense = new ExpenseEntity();
    expense.amount = amount;
    expense.currency = currency;
    expense.source = 'BBVA - PAGO DE SERVICIO';
    expense.comments = serviceName;
    return expense;
  }
};
