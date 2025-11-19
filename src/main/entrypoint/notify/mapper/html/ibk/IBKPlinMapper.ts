import { ExpenseEntity } from '../../../../../commons/repository/expense/entity/ExpenseEntity';
import { NumberFormatter } from '../../../utils/NumberFormatter';
import type { IExpenseHtmlMapper } from '../IExpenseHtmlMapper';
import { Strings } from '../../../../../commons/constants/Strings';
import { CurrencyCodes } from '../../../../../commons/constants/Currency';

function extractAmountMatch(html: string): RegExpMatchArray | null {
  const idx = html.search(/Moneda\s*y\s*monto\s*:?/i);
  let slice = idx >= 0 ? html.slice(idx) : html;
  const trEnd = slice.search(/<\/tr>/i);
  if (trEnd > 0) slice = slice.slice(0, trEnd);

  let m = slice.match(/S\/(?:\s|&nbsp;|&#160;|<[^>]*>)*([0-9]+(?:[.,][0-9]{2})?)/i);
  if (!m) {
    const normalized = slice
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;|&#160;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    m = normalized.match(/S\/\s*([0-9]+(?:[.,][0-9]{2})?)/i);
  }
  return m;
}

function extractRecipient(html: string): string {
  const idx = html.search(/Destinatario\s*:?/i);
  if (idx < 0) return Strings.EMPTY;

  let slice = html.slice(idx);
  const trEnd = slice.search(/<\/tr>/i);
  if (trEnd > 0) slice = slice.slice(0, trEnd);

  const tdNeighbor = slice.match(/<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i);
  const raw = tdNeighbor ? tdNeighbor[1] : '';
  const clean = raw.replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ').replace(/\s+/g, ' ').trim();
  return clean || Strings.EMPTY;
}

export const IBKPlinMapper: IExpenseHtmlMapper = {

  supports(from: string, subject: string): boolean {
    return /servicioalcliente@netinterbank\.com\.pe/i.test(from) && /Constancia de Pago Plin/i.test(subject);
  },

  toEntity(bodyHtml: string): ExpenseEntity {
    const amountNumberMatch = extractAmountMatch(bodyHtml);
    const amountNumber = NumberFormatter.parseNumber(amountNumberMatch);
    const recipient = extractRecipient(bodyHtml);

    let expense = new ExpenseEntity();
    expense.amount = amountNumber;
    expense.currency = CurrencyCodes.PEN;
    expense.source = 'INTERBANK - PLIN';
    expense.comments = recipient || Strings.EMPTY;
    return expense;
  }
};
