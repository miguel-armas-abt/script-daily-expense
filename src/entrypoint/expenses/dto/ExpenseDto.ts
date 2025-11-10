import type { Currency } from './../constants/AppConstants';

export type ExpenseDtoArgs = {
  gmailMessageId?: string;
  source?: string;
  kind?: string;
  amount?: number | null;
  currency?: Currency | string;
  expenseDate?: any;
  subject?: string;
  from?: string;
  comments?: string;
  category?: string;
};

export class ExpenseDto {
  gmailMessageId: string;
  source: string;
  kind: string;
  amount: number | null;
  currency: string;
  expenseDate: any;
  subject: string;
  from: string;
  comments: string;
  category?: string;

  constructor(args: ExpenseDtoArgs) {
    this.gmailMessageId = args.gmailMessageId || '';
    this.source = args.source || '';
    this.kind = args.kind || '';
    this.amount = args.amount != null ? args.amount : null;
    this.currency = args.currency || '';
    this.expenseDate = args.expenseDate || '';
    this.subject = args.subject || '';
    this.from = args.from || '';
    this.comments = args.comments || '';
    this.category = args.category;
  }

  toRepositoryPayload() {
    return {
      gmailMessageId: this.gmailMessageId,
      source: this.source,
      kind: this.kind,
      amount: this.amount,
      currency: this.currency,
      expenseDate: this.expenseDate,
      subject: this.subject,
      from: this.from,
      comments: this.comments,
      category: this.category
    };
  }
}
