import { Currency, CurrencyParser } from "../../../../../commons/constants/Currency";
import { Strings } from "../../../../../commons/constants/Strings";
import { ExpenseEntity } from "../../../../../commons/repository/expense/entity/ExpenseEntity";
import { BCPPatterns } from "../../../constants/BCP";
import { IExpenseHtmlMapper } from "../IExpenseHtmlMapper";

export const BCPYapePaymentHtml = Object.freeze({

    SUBJECT_REGEX: /yapeo de servicio ha sido confirmado/i,
    AMOUNT_AND_CURRENCY_KEY_REGEX: /Monto\s+total/i,
    AMOUNT_AND_CURRENCY_REGEX: /(S\/|\$)(?:\s|&nbsp;|&#160;|<[^>]*>)*([0-9]+(?:[.,][0-9]{2})?)/i,
    RECIPIENT_REGEX: /Empresa\s*:?/i,

    END_TABLE_ROW: /<\/tr>/i,
    TABLE_CELL_VALUE: /<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i,
    HTML_TAGS: /<[^>]+>/g,
    HTML_NBSP: /&nbsp;|&#160;/gi,
    MULTIPLE_SPACES: /\s+/g,

} as const);

function getTableRowSliceByKey(html: string, keyPattern: RegExp): string {
    const keyIndex = html.search(keyPattern);
    if (keyIndex < 0) {
        throw new Error(`[bcp-yape-service][mapper] Key not found for pattern: ${keyPattern}`);
    }

    let rowSlice = html.slice(keyIndex);
    const rowEndIndex = rowSlice.search(BCPYapePaymentHtml.END_TABLE_ROW);
    if (rowEndIndex > 0) {
        rowSlice = rowSlice.slice(0, rowEndIndex);
    }

    return rowSlice;
}

function getAmountAndCurrency(html: string): { amount: number; currency: Currency } {
    const keyIndex = html.search(BCPYapePaymentHtml.AMOUNT_AND_CURRENCY_KEY_REGEX);
    const slice = keyIndex >= 0 ? html.slice(keyIndex) : html;

    const match = slice.match(BCPYapePaymentHtml.AMOUNT_AND_CURRENCY_REGEX);
    if (!match) {
        throw new Error("[bcp-yape-service][mapper] Field not matched: amount & currency");
    }

    const currencySymbol = match[1];
    const amountNumber = Number(match[2]);
    const currencyCode = CurrencyParser.parseFromSymbol(currencySymbol);

    return {
        amount: amountNumber,
        currency: currencyCode,
    };
}

function getCompany(html: string): string {
    const companyRowHtml = getTableRowSliceByKey(html, BCPYapePaymentHtml.RECIPIENT_REGEX);

    const companyMatch = companyRowHtml.match(BCPYapePaymentHtml.TABLE_CELL_VALUE);
    if (!companyMatch) {
        return Strings.EMPTY;
    }

    const rawCompany = companyMatch[1];

    const normalizedCompany = rawCompany
        .replace(BCPYapePaymentHtml.HTML_TAGS, Strings.SPACE)
        .replace(BCPYapePaymentHtml.HTML_NBSP, Strings.SPACE)
        .replace(BCPYapePaymentHtml.MULTIPLE_SPACES, Strings.SPACE)
        .trim();

    return normalizedCompany;
}

export const BCPYapePaymentMapper: IExpenseHtmlMapper = {

    supports(from: string, subject: string): boolean {
        return BCPPatterns.FROM_NOREPLY_YAPE.test(from) &&
            BCPYapePaymentHtml.SUBJECT_REGEX.test(subject);
    },

    toEntity(bodyHtml: string): ExpenseEntity {
        const { amount, currency } = getAmountAndCurrency(bodyHtml);
        const company = getCompany(bodyHtml);

        const expense = new ExpenseEntity();
        expense.amount = amount;
        expense.currency = currency;
        expense.source = "BCP - YAPE DE SERVICIO";
        expense.comments = company || Strings.EMPTY;
        return expense;
    }
};
