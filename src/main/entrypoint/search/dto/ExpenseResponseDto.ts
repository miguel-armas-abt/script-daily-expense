export class ExpenseResponseDto {
  gmailMessageId?: string;
  source?: string;
  amount?: string;
  category?: string;
  comments?: string;
  expenseDate?: string;
  
  constructor(init?: Partial<ExpenseResponseDto>) {
    Object.assign(this, init);
  }
}
