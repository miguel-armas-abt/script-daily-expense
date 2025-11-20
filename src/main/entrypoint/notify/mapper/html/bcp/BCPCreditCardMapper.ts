import { Currency, CurrencyParser } from "../../../../../commons/constants/Currency";
import { Strings } from "../../../../../commons/constants/Strings";
import { ExpenseEntity } from "../../../../../commons/repository/expense/entity/ExpenseEntity";
import { BCPPatterns } from "../../../constants/BCP";
import { IExpenseHtmlMapper } from "../IExpenseHtmlMapper";

export const BCPCreditCardHtml = Object.freeze({

    SUBJECT_REGEX: /Tarjeta de Cr[eé]dito BCP/i,
    AMOUNT_AND_CURRENCY_KEY_REGEX: /Total\s+del\s+consumo/i,
    AMOUNT_AND_CURRENCY_REGEX: /(S\/|\$)(?:\s|&nbsp;|&#160;|<[^>]*>)*([0-9]+(?:[.,][0-9]{2})?)/i,
    COMPANY_REGEX: /Empresa\s*:?/i,

    END_TABLE_ROW: /<\/tr>/i,
    TABLE_CELL_VALUE: /<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i,
    HTML_TAGS: /<[^>]+>/g,
    HTML_NBSP: /&nbsp;|&#160;/gi,
    MULTIPLE_SPACES: /\s+/g,

} as const);

function getTableRowSliceByKey(html: string, keyPattern: RegExp): string {
    const keyIndex = html.search(keyPattern);
    if (keyIndex < 0) {
        throw new Error(`[bcp-credit-card][mapper] Key not found for pattern: ${keyPattern}`);
    }

    let rowSlice = html.slice(keyIndex);
    const rowEndIndex = rowSlice.search(BCPCreditCardHtml.END_TABLE_ROW);
    if (rowEndIndex > 0) {
        rowSlice = rowSlice.slice(0, rowEndIndex);
    }

    return rowSlice;
}

function getAmountAndCurrency(html: string): { amount: number; currency: Currency } {
    const amountRowHtml = getTableRowSliceByKey(html, BCPCreditCardHtml.AMOUNT_AND_CURRENCY_KEY_REGEX);

    const match = amountRowHtml.match(BCPCreditCardHtml.AMOUNT_AND_CURRENCY_REGEX);
    if (!match) {
        throw new Error("[bcp-credit-card][mapper] Field not matched: amount & currency");
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
    const companyRowHtml = getTableRowSliceByKey(html, BCPCreditCardHtml.COMPANY_REGEX);

    const companyMatch = companyRowHtml.match(BCPCreditCardHtml.TABLE_CELL_VALUE);
    if (!companyMatch)
        return Strings.EMPTY;

    const rawCompany = companyMatch[1];

    const normalizedCompany = rawCompany
        .replace(BCPCreditCardHtml.HTML_TAGS, Strings.SPACE)
        .replace(BCPCreditCardHtml.HTML_NBSP, Strings.SPACE)
        .replace(BCPCreditCardHtml.MULTIPLE_SPACES, Strings.SPACE)
        .trim();

    return normalizedCompany;
}

export const BCPCreditCardMapper: IExpenseHtmlMapper = {

    supports(from: string, subject: string): boolean {
        return BCPPatterns.FROM_NOTIFICATIONS_BCP.test(from) &&
            BCPCreditCardHtml.SUBJECT_REGEX.test(subject);
    },

    toEntity(bodyHtml: string): ExpenseEntity {
        const html = String(bodyHtml);

        const { amount, currency } = getAmountAndCurrency(html);
        const company = getCompany(html);

        const expense = new ExpenseEntity();
        expense.amount = amount;
        expense.currency = currency;
        expense.source = "BCP - CONSUMO DE TARJETA CREDITO";
        expense.comments = company || Strings.EMPTY;
        return expense;
    }
};