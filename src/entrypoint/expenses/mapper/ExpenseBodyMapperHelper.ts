import { ExpenseDto } from '../dto/ExpenseDto';

export const ExpenseBodyMapperHelper = (() => {
  function completeFields(
    expense: ExpenseDto,
    gmailMessageId: string,
    expenseDate: GoogleAppsScript.Base.Date | Date | null,
    from: string,
    subject: string
  ) {
    expense.gmailMessageId = gmailMessageId;
    expense.expenseDate = expenseDate || '';
    expense.from = from;
    expense.subject = subject;
  }

  return { completeFields };
})();
