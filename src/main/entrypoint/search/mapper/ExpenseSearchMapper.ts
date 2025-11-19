import { CurrencySymbols } from "../../../commons/constants/Currency";
import { ExpenseEntity } from "../../../commons/repository/expense/entity/ExpenseEntity";
import { TimeUtil } from "../../../commons/utils/TimeUtil";
import { ExpenseResponseDto } from "../dto/ExpenseResponseDto";

export const ExpenseSearchMapper = (() => {

    function toDto(expense: ExpenseEntity): ExpenseResponseDto {
        if (!expense.amount)
            throw new Error('[search][mapper] The field is required: amount');

        if (!expense.currency)
            throw new Error('[search][mapper] The field is required: currency');

        if (!expense.expenseDate)
            throw new Error('[search][mapper] The field is required: expenseDate');

        const amountStr = CurrencySymbols[expense.currency] + expense.amount;
        return new ExpenseResponseDto({
            gmailMessageId: expense.gmailMessageId,
            source: expense.source,
            amount: amountStr,
            category: expense.category,
            comments: expense.comments,
            expenseDate: TimeUtil.toTimeZoneString(expense.expenseDate)
        })
    }

    return { toDto };
})();