import { ExpenseDto } from '../dto/ExpenseDto';
import { EmailWrapper } from '../repository/gmail/wrapper/EmailWrapper';
import { MapperRegistry } from './ExpenseBodyMapperRegistry';

export const ExpenseBodyMapperHelper = (() => {

  function toExpenseDto(email: EmailWrapper): ExpenseDto | undefined {
    let expense: ExpenseDto | undefined;
    const mappers = MapperRegistry.getAll();
    for (let i = 0; i < mappers.length; i++) {
      const mapper = mappers[i];
      try {

        if (!mapper.supports(email.from, email.subject)) continue;
        expense = mapper.toExpenseDto(email.bodyHtml);
        expense.gmailMessageId = email.gmailMessageId;

      } catch (exception) {
        Logger.log('%s | error=%s', (mapper as any)?.supports?.name || 'unknown', exception);
      }
    }
    return expense;
  }

  return { toExpenseDto };
})();
