import { Strings } from "../../../commons/constants/Strings";
import { ExpenseEntity } from "../../../commons/repository/expense/entity/ExpenseEntity";
import { ExpenseRepository } from "../../../commons/repository/expense/ExpenseRepository";

const ExpenseUpdateService = (() => {

    function updateExpense(payload: {
        gmailMessageId: string;
        category: string;
        comments?: string;
        amount?: string;
    }): boolean {

        const gmailMessageId = (payload && payload.gmailMessageId) ? String(payload.gmailMessageId).trim() : Strings.EMPTY;
        const category = (payload && payload.category) ? String(payload.category).trim() : Strings.EMPTY;
        const comments = (payload && payload.comments != null) ? String(payload.comments).trim() : Strings.EMPTY;
        const amountStr = (payload && payload.amount != null) ? String(payload.amount).trim() : Strings.EMPTY;

        if (!gmailMessageId) 
            throw new Error('[update][service] The field is required: gmailMessageId');

        if (!category) 
            throw new Error('[update][service] The field is required: category');

        if (!amountStr) 
            throw new Error('[update][service] The field is required: amount');

        const amountNumber = Number(amountStr);
        if (amountStr && Number.isNaN(amountNumber))
            throw new Error('[update][service] Invalid field: amount=' + amountStr);

        const expense = new ExpenseEntity({
                    gmailMessageId: gmailMessageId,
                    category: category,
                    amount: amountNumber,
                    comments: comments      
                });

        const isUpdated = ExpenseRepository.updateByGmailMessageId(expense);
        if (!isUpdated)
            throw new Error('[update][service] Record could not be updated: ' + gmailMessageId);
        return true;
    }

    return { updateExpense: updateExpense };
})();

export default ExpenseUpdateService;