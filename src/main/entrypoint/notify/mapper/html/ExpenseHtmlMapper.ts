import { ExpenseEntity } from '../../../../commons/repository/expense/entity/ExpenseEntity';
import { EmailWrapper } from '../../repository/gmail/wrapper/EmailWrapper';
import { TimeUtil } from '../../../../commons/utils/TimeUtil';
import { MapperRegistry } from './ExpenseHtmlMapperRegistry';

export const ExpenseHtmlMapper = (() => {

  function toEntity(email: EmailWrapper): ExpenseEntity | undefined {
    if (!email.from) 
      throw new Error('[toEntity][mapper] The field is required: from');

    if (!email.subject) 
      throw new Error('[toEntity][mapper] The field is required: subject');

    if (!email.bodyHtml) 
      throw new Error('[toEntity][mapper] The field is required: bodyHtml');

    let expense: ExpenseEntity | undefined;
    const mappers = MapperRegistry.getAll();
    for (let i = 0; i < mappers.length; i++) {
      const mapper = mappers[i];
      try {

        if (!mapper.supports(email.from, email.subject)) continue;
        expense = mapper.toEntity(email.bodyHtml);
        expense.gmailMessageId = email.gmailMessageId;
        expense.checkedAt = TimeUtil.nowUtcString();
        expense.expenseDate = email.date;

      } catch (exception) {
        Logger.log('%s | error=%s', (mapper as any)?.supports?.name || 'unknown', exception);
      }
    }
    return expense;
  }

  return { toEntity: toEntity };
})();
