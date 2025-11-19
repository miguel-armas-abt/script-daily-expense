import { Strings } from "../../../commons/constants/Strings";
import { ExpenseEntity } from "../../../commons/repository/expense/entity/ExpenseEntity";
import { ExpenseRepository } from "../../../commons/repository/expense/ExpenseRepository";
import { Source } from "../../../commons/constants/Source";
import { TimeUtil } from "../../../commons/utils/TimeUtil";
import { CurrencyCodes } from "../../../commons/constants/Currency";

const ExpenseSaveService = (() => {

    function saveExpense(payload: {
        category: string;
        expenseDate: string;
        amount: string;
        comments?: string;
    }): string {

        const category = (payload && payload.category) ? String(payload.category).trim() : Strings.EMPTY;
        const expenseDateStr = (payload && payload.expenseDate != null) ? String(payload.expenseDate).trim() : Strings.EMPTY;
        const amountStr = (payload && payload.amount != null) ? String(payload.amount).trim() : Strings.EMPTY;
        const comments = (payload && payload.comments != null) ? String(payload.comments).trim() : Strings.EMPTY;
        
        if (!category) 
            throw new Error('[insert][service] The field is required: category');

        if (!expenseDateStr) 
            throw new Error('[insert][service] The field is required: expenseDate');

        if (!amountStr) 
            throw new Error('[insert][service] The field is required: amount');

        const amountNumber = Number(amountStr);
        if (Number.isNaN(amountNumber)) 
            throw new Error('[insert][service] Invalid field: amount=' + amountStr);

        const expense = new ExpenseEntity({
            gmailMessageId: Utilities.getUuid(),
            category: category,
            expenseDate: TimeUtil.nowUtcString(),
            currency: CurrencyCodes.PEN,
            amount: amountNumber,
            comments: comments,
            source: Source.MANUALLY            
        });

        const createdId = ExpenseRepository.insert(expense);
        if (!createdId) 
            throw new Error('[insert][service] Record could not be saved.');

        ExpenseRepository.sortByExpenseDateDesc();
        return createdId;
    }

    return { saveExpense: saveExpense };
})();

export default ExpenseSaveService;