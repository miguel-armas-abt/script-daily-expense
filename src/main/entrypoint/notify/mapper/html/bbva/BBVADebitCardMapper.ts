import { ExpenseEntity } from '../../../../../commons/repository/expense/entity/ExpenseEntity';
import { NumberFormatter } from '../../../utils/NumberFormatter';
import type { IExpenseHtmlMapper } from '../IExpenseHtmlMapper';
import { Currency, CurrencyCodes } from '../../../../../commons/constants/Currency';
import { Strings } from '../../../../../commons/constants/Strings';

function extractCurrency(bodyHtml: string): Currency {
  const currencyMatch = bodyHtml.match(/Moneda:\s*<\/p>\s*<p[^>]*>\s*([A-Z]{3})/i);
  if (currencyMatch) {
    const code = currencyMatch[1].toUpperCase();
    switch (code) {
      case 'PEN':
      case 'S/':
        return CurrencyCodes.PEN;
      case 'USD':
      case 'US$':
        return CurrencyCodes.USD;
    }
  }   
  return /\bS\/\b/i.test(bodyHtml) ? CurrencyCodes.PEN : CurrencyCodes.USD;
}

function extractMerchantName(bodyHtml: string): string {
  let merchantName: string = Strings.EMPTY;
  const merchantMatch =
    bodyHtml.match(/Comercio\s*:?\s*<\/p>\s*<p[^>]*>\s*([^<]+)/i) ||
    bodyHtml.match(/Comercio\s*:?\s*<\/td>\s*<td[^>]*>\s*([^<]+)/i);

  if (merchantMatch && merchantMatch[1]) {
    merchantName = merchantMatch[1].replace(/&nbsp;|&#160;/gi, ' ').replace(/\s+/g, ' ').trim();
  } else {
    const normalizedBodyHtml = bodyHtml
      .replace(/<\s*\/?p[^>]*>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;|&#160;/gi, ' ')
      .replace(/\s+\n/g, '\n')
      .replace(/\n\s+/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .trim();

    const lines = normalizedBodyHtml.split(/\n+/);
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*Comercio\s*:?\s*$/i.test(lines[i])) {
        merchantName = (lines[i + 1] || '').trim();
        break;
      }
    }
  }
  return merchantName || Strings.EMPTY;
}

export const BBVADebitCardMapper: IExpenseHtmlMapper = {

  supports(from: string, subject: string): boolean {
    return /procesos@bbva\.com\.pe/i.test(from) && /Has realizado.*consumo.*tarjeta\s*BBVA/i.test(subject);
  },

  toEntity(bodyHtml: string): ExpenseEntity {
    const amountText = bodyHtml.match(/Monto:\s*<\/p>\s*<p[^>]*>\s*([0-9]+(?:[.,][0-9]{2})?)/i);
    const amountNumber = NumberFormatter.parseNumber(amountText);
    const currency = extractCurrency(bodyHtml);
    const merchantName = extractMerchantName(bodyHtml);

    let expense =  new ExpenseEntity();
    expense.amount = amountNumber;
    expense.currency = currency;
    expense.source = 'BBVA - TARJETA';
    expense.comments = merchantName;
    return expense;
  }
};
