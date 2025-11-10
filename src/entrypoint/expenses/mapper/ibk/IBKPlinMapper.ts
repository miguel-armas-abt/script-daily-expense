import { ExpenseDto } from '../../dto/ExpenseDto';
import { AppConstants } from '../../constants/AppConstants';
import { NumberFormatter } from '../../utils/NumberFormatter';
import type { ExpenseBodyMapper } from '../ExpenseBodyMapper';
import { CurrencyConstants } from '../../enums/Currency';

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
  if (idx < 0) return AppConstants.DEFAULT;

  let slice = html.slice(idx);
  const trEnd = slice.search(/<\/tr>/i);
  if (trEnd > 0) slice = slice.slice(0, trEnd);

  const tdNeighbor = slice.match(/<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i);
  const raw = tdNeighbor ? tdNeighbor[1] : '';
  const clean = raw.replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ').replace(/\s+/g, ' ').trim();
  return clean || AppConstants.DEFAULT;
}

export const IBKPlinMapper: ExpenseBodyMapper = {
  supports(from: string, subject: string): boolean {
    return /servicioalcliente@netinterbank\.com\.pe/i.test(from) && /Constancia de Pago Plin/i.test(subject);
  },
  toExpenseDto(bodyHtml: string): ExpenseDto {
    const amountNumberMatch = extractAmountMatch(bodyHtml);
    const amountNumber = NumberFormatter.parseNumber(amountNumberMatch);
    const recipient = extractRecipient(bodyHtml);

    return new ExpenseDto({
      amount: amountNumber,
      currency: CurrencyConstants.CURRENCY_PEN,
      source: 'INTERBANK - PLIN',
      comments: recipient || AppConstants.DEFAULT
    });
  }
};
