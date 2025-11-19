import type { Currency } from '../../../../commons/constants/Currency';

export class ExpenseEntity {
  gmailMessageId?: string;
  checkedAt?: string;
  source?: string;
  currency?: Currency;
  amount?: number;
  category?: string;
  comments?: string;
  expenseDate?: string;
  
  constructor(init?: Partial<ExpenseEntity>) {
    Object.assign(this, init);
  }
}
