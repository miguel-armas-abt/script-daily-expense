import { ExpenseDto } from '../dto/ExpenseDto';

export interface ExpenseBodyMapper {
  supports(from: string, subject: string): boolean;
  toExpenseDto(bodyHtml: string): ExpenseDto;
}