import type { Currency } from '../enums/Currency';
import { Strings } from '../constants/Strings';

export type ExpenseDtoArgs = {
  gmailMessageId?: string;
  source?: string;
  amount?: number | null;
  currency?: Currency | null;
  comments?: string;
  category?: string;
};

export class ExpenseDto {
  gmailMessageId: string;
  source: string;
  amount: number | null;
  currency: Currency | null;
  comments: string;
  category: string;

  constructor(args: ExpenseDtoArgs) {
    this.gmailMessageId = args.gmailMessageId || Strings.EMPTY;
    this.source = args.source || Strings.EMPTY;
    this.amount = args.amount != null ? args.amount : null;
    this.currency = args.currency != null ? args.currency : null;
    this.comments = args.comments || Strings.EMPTY;
    this.category = args.category || Strings.EMPTY;
  }
}
