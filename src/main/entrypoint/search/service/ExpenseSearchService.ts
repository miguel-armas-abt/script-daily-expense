import { Properties } from "../../../commons/config/Properties";
import { Props } from "../../../commons/constants/Props";
import { Strings } from "../../../commons/constants/Strings";
import { ExpenseEntity } from "../../../commons/repository/expense/entity/ExpenseEntity";
import { ExpenseRepository } from "../../../commons/repository/expense/ExpenseRepository";
import { TimeUtil } from "../../../commons/utils/TimeUtil";
import { ExpenseResponseDto } from "../dto/ExpenseResponseDto";
import { ExpenseSearchMapper } from "../mapper/ExpenseSearchMapper";

const ExpenseSearchService = (() => {

    type ExpenseFilters = {
        whatEverText?: string;
        from?: string;   // yyyy-MM-dd
        to?: string;     // yyyy-MM-dd
        category?: string;
        page?: number;
    }

    function findExpensesByFilters(filters: ExpenseFilters): {
        items: ExpenseResponseDto[];
        total: number;
        totalPages: number;
        page: number;
    } {
        const page = Math.max(1, Number(filters?.page || 1));

        const maxPageSize = Number(Properties.get(Props.SEARCH_VIEW_MAX_PAGE_SIZE));
        const pageSize = Math.max(1, Math.min(100, maxPageSize));

        const whatEverText = (filters?.whatEverText || Strings.EMPTY).toLowerCase().trim();
        const category = (filters?.category || Strings.EMPTY).toLowerCase().trim();
        const from = (filters?.from || Strings.EMPTY).trim();
        const to = (filters?.to || Strings.EMPTY).trim();

        const filteredExpenses = ExpenseRepository.findAll()
            .filter(expense => {
                if (!expense.expenseDate)
                    throw new Error('[search][service] The field doesnt exist: expenseDate');

                if (!expense.category)
                    throw new Error('[search][service] The field doesnt exist: category');

                const textOk = isTextIncluded(whatEverText, expense);
                const categoryOk = !category || expense.category.toLowerCase() === category;
                const expenseDate = TimeUtil.toDateFromUtc(expense.expenseDate);
                const dateOk = isWithinDateRange(expenseDate, from, to);

                return textOk && categoryOk && dateOk;
            })
            .sort((a, b) => {
                if (!a.expenseDate || !b.expenseDate)
                    throw new Error('[search][service] The field doesnt exist: expenseDate');

                const da = TimeUtil.toDateFromUtc(a.expenseDate).getTime();
                const db = TimeUtil.toDateFromUtc(b.expenseDate).getTime();
                return db - da;
            })
            .map(expense => {
                return ExpenseSearchMapper.toDto(expense);
            });

        const total = filteredExpenses.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const start = (page - 1) * pageSize;
        const items = filteredExpenses.slice(start, start + pageSize);

        return { 
            items,
            total,
            totalPages,
            page
        };
    }

    function isTextIncluded(whatEverText: string, expense: ExpenseEntity): boolean {
        return !whatEverText || [
            String(expense.category || Strings.EMPTY).toLowerCase(),
            String(expense.comments || Strings.EMPTY).toLowerCase(),
            String(expense.source || Strings.EMPTY).toLowerCase(),
        ].some(s => s.includes(whatEverText));
    }

    function isWithinDateRange(expenseDate: Date, from?: string, to?: string): boolean {
        const hasFrom = !!from;
        const hasTo = !!to;

        if (hasFrom) {
            const fromDate = new Date(`${from}T00:00:00`);
            if (expenseDate < fromDate) return false;
        }

        if (hasTo) {
            const toDate = new Date(`${to}T23:59:59`);
            if (expenseDate > toDate) return false;
        }

        return true;
    }

    return { findExpensesByFilters: findExpensesByFilters };
})();

export default ExpenseSearchService;