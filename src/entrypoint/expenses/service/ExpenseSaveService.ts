import { Strings } from "../constants/Strings";
import { Categories } from "../constants/Categories";
import { ExpenseDto } from "../dto/ExpenseDto";
import { CurrencyConstants } from "../enums/Currency";
import { ExpenseRepository } from "../repository/expense/ExpenseRepository";

const ExpenseSaveService = (() => {

    function saveExpense(payload: {
        category: string;
        comments?: string;
        amount: string;
        source?: string;
        expenseDate: string;
    }): string {
        const amountStr = (payload && payload.amount != null) ? String(payload.amount).trim() : Strings.EMPTY;
        const category = (payload && payload.category) ? String(payload.category).trim() : Strings.EMPTY;
        const comments = (payload && payload.comments != null) ? String(payload.comments).trim() : Strings.EMPTY;
        const expenseDateStr = (payload && payload.expenseDate != null) ? String(payload.expenseDate).trim() : Strings.EMPTY;

        if (!amountStr) throw new Error('amount is required');
        if (!category) throw new Error('category is required');
        if (!expenseDateStr) throw new Error('expenseDate is required');

        const amountNum = Number(amountStr);
        if (Number.isNaN(amountNum)) throw new Error('Invalid amount');

        const expense = new ExpenseDto({
            gmailMessageId: Utilities.getUuid(),
            source: Categories.MANUALLY,
            amount: amountNum,
            currency: CurrencyConstants.CURRENCY_PEN,
            comments,
            category
        });

        const createdId = ExpenseRepository.insertWithDateString(expense, expenseDateStr);
        if (!createdId) throw new Error('The expense could not be recorded.');
        ExpenseRepository.sortByExpenseDateDesc();
        return createdId;
    }

    return { saveExpense: saveExpense };
})();

export default ExpenseSaveService;