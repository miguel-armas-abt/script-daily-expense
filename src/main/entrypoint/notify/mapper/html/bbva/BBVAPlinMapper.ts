import { ExpenseEntity } from '../../../../../commons/repository/expense/entity/ExpenseEntity';
import { NumberFormatter } from '../../../utils/NumberFormatter';
import type { IExpenseHtmlMapper } from '../IExpenseHtmlMapper';
import { Strings } from '../../../../../commons/constants/Strings';
import { CurrencyCodes } from '../../../../../commons/constants/Currency';

function extractRecipient(bodyHtml: string): string {
  let recipient: string = Strings.EMPTY;
  const recipientMatch = bodyHtml.match(/(?:&nbsp;|\s)*a(?:&nbsp;|\s)+([^<\r\n]+)/i);
  if (recipientMatch && recipientMatch[1]) {
    recipient = recipientMatch[1].replace(/&nbsp;|&#160;/gi, ' ').replace(/\s+/g, ' ').trim() || Strings.EMPTY;
  } else {
    const normalizedBodyHtml = bodyHtml
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;|&#160;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const recipientMatchFallback = normalizedBodyHtml.match(/^\s*a\s+(.+?)(?=$|\.|,|\s{2,})/i);
    if (recipientMatchFallback && recipientMatchFallback[1]) {
      recipient = recipientMatchFallback[1].replace(/\s+/g, ' ').trim() || Strings.EMPTY;
    }
  }
  return recipient;
}

export const BBVAPlinMapper: IExpenseHtmlMapper = {

  supports(from: string, subject: string): boolean {
    return /procesos@bbva\.com\.pe/i.test(from) && /transferencia PLIN/i.test(subject);
  },
  
  toEntity(bodyHtml: string): ExpenseEntity {
    const amountText = bodyHtml.match(/Plineaste\s*S\/&nbsp;?([0-9]+(?:[.,][0-9]{2})?)/i);
    const amountNumber = NumberFormatter.parseNumber(amountText);
    let recipient: string = Strings.EMPTY;
    if (amountText && typeof (amountText as any).index === 'number') {
      const idx = (amountText as any).index as number;
      const tailHtml = bodyHtml.slice(idx + amountText[0].length);
      recipient = extractRecipient(tailHtml);
    } else {
      recipient = extractRecipient(bodyHtml);
    }

    let expense = new ExpenseEntity();
    expense.amount = amountNumber;
    expense.currency = CurrencyCodes.PEN,
    expense.source = 'BBVA - PLIN',
    expense.comments = recipient;
    return expense;
  }
};
