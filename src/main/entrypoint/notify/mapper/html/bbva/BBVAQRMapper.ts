import { CurrencyCodes } from '../../../../../commons/constants/Currency';
import { Strings } from '../../../../../commons/constants/Strings';
import { ExpenseEntity } from '../../../../../commons/repository/expense/entity/ExpenseEntity';
import { NumberFormatter } from '../../../utils/NumberFormatter';
import type { IExpenseHtmlMapper } from '../IExpenseHtmlMapper';

function extractMerchantName(bodyHtml: string): string {
  const merchantMatch = bodyHtml.match(/Comercio(?:\s|&nbsp;)*<\/p>\s*<p[^>]*>\s*([^<]+)/i);
  let merchantName: string = Strings.EMPTY;

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
      if (/^\s*Comercio\s*$/i.test(lines[i])) {
        merchantName = (lines[i + 1] || '').trim();
        break;
      }
    }
  }
  return merchantName;
}

export const BBVAQRMapper: IExpenseHtmlMapper = {

  supports(from: string, subject: string): boolean {
    return /procesos@bbva\.com\.pe/i.test(from) && /pago a comercios con QR/i.test(subject);
  },

  toEntity(bodyHtml: string): ExpenseEntity {
    const amountText =
      bodyHtml.match(/Importe\s+pagado[^<]*?<[^>]*?>\s*S\/\s*([0-9]+(?:[.,][0-9]{2})?)/i) ||
      bodyHtml.match(/S\/\s*([0-9]+(?:[.,][0-9]{2})?)/i);
    const amountNumber = NumberFormatter.parseNumber(amountText);
    const merchantName = extractMerchantName(bodyHtml);

    let expense = new ExpenseEntity();
    expense.amount = amountNumber;
    expense.currency = CurrencyCodes.PEN;
    expense.source = 'BBVA - QR';
    expense.comments = merchantName;
    return expense;
  }
};
