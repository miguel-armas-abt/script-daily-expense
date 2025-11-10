import { ExpenseDto } from '../../dto/ExpenseDto';
import { AppConstants } from '../../constants/AppConstants';
import { UtilNumberFormatter } from '../../utils/UtilNumberFormatter';
import type { ExpenseBodyMapper } from '../ExpenseBodyMapper';

function extractRecipient(bodyHtml: string): string {
  let recipient: string = AppConstants.DEFAULT;
  const recipientMatch = bodyHtml.match(/(?:&nbsp;|\s)*a(?:&nbsp;|\s)+([^<\r\n]+)/i);
  if (recipientMatch && recipientMatch[1]) {
    recipient = recipientMatch[1].replace(/&nbsp;|&#160;/gi, ' ').replace(/\s+/g, ' ').trim() || AppConstants.DEFAULT;
  } else {
    const normalizedBodyHtml = bodyHtml
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;|&#160;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const recipientMatchFallback = normalizedBodyHtml.match(/^\s*a\s+(.+?)(?=$|\.|,|\s{2,})/i);
    if (recipientMatchFallback && recipientMatchFallback[1]) {
      recipient = recipientMatchFallback[1].replace(/\s+/g, ' ').trim() || AppConstants.DEFAULT;
    }
  }
  return recipient;
}

export const BBVAPlinMapper: ExpenseBodyMapper = {
  supports(from: string, subject: string): boolean {
    return /procesos@bbva\.com\.pe/i.test(from) && /transferencia PLIN/i.test(subject);
  },
  toExpenseDto(bodyHtml: string): ExpenseDto {
    const amountText = bodyHtml.match(/Plineaste\s*S\/&nbsp;?([0-9]+(?:[.,][0-9]{2})?)/i);
    const amountNumber = UtilNumberFormatter.parseNumber(amountText);
    let recipient: string = AppConstants.DEFAULT;
    if (amountText && typeof (amountText as any).index === 'number') {
      const idx = (amountText as any).index as number;
      const tailHtml = bodyHtml.slice(idx + amountText[0].length);
      recipient = extractRecipient(tailHtml);
    } else {
      recipient = extractRecipient(bodyHtml);
    }

    return new ExpenseDto({
      amount: amountNumber,
      currency: AppConstants.CURRENCY_PEN,
      source: 'BBVA',
      kind: 'PLIN',
      comments: recipient
    });
  }
};
