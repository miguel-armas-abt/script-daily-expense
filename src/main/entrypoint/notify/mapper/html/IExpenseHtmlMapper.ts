import { ExpenseEntity } from '../../../../commons/repository/expense/entity/ExpenseEntity';

export interface IExpenseHtmlMapper {

  supports(from: string, subject: string): boolean;
  toEntity(bodyHtml: string): ExpenseEntity;
  
}