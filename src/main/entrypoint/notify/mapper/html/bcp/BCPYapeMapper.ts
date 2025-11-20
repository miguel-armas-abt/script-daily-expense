import { Currency, CurrencyParser } from "../../../../../commons/constants/Currency";
import { Strings } from "../../../../../commons/constants/Strings";
import { ExpenseEntity } from "../../../../../commons/repository/expense/entity/ExpenseEntity";
import { BCPPatterns } from "../../../constants/BCP";
import { IExpenseHtmlMapper } from "../IExpenseHtmlMapper";

export const BCPYapeHtml = Object.freeze({

    SUBJECT_REGEX: /Pago exitoso/i,
    AMOUNT_AND_CURRENCY_KEY_REGEX: /Monto\s+total/i,
    AMOUNT_AND_CURRENCY_REGEX: /(S\/|\$)(?:\s|&nbsp;|&#160;|<[^>]*>)*([0-9]+(?:[.,][0-9]{2})?)/i,
    RECIPIENT_REGEX: /Tu\s+pago\s+en\s+(.+?)\s+fue\s+exitoso/i,

    HTML_TAGS: /<[^>]+>/g,
    HTML_NBSP: /&nbsp;|&#160;/gi,
    MULTIPLE_SPACES: /\s+/g,

} as const);

function getAmountAndCurrency(html: string): { amount: number; currency: Currency } {
    const keyIndex = html.search(BCPYapeHtml.AMOUNT_AND_CURRENCY_KEY_REGEX);
    const slice = keyIndex >= 0 ? html.slice(keyIndex) : html;

    const match = slice.match(BCPYapeHtml.AMOUNT_AND_CURRENCY_REGEX);
    if (!match) {
        throw new Error("[bcp-yape][mapper] Field not matched: amount & currency");
    }

    const currencySymbol = match[1];
    const amountNumber = Number(match[2]);
    const currencyCode = CurrencyParser.parseFromSymbol(currencySymbol);

    return {
        amount: amountNumber,
        currency: currencyCode,
    };
}

function getMerchant(html: string): string {
    const flattenedText = html
        .replace(BCPYapeHtml.HTML_TAGS, Strings.SPACE)
        .replace(BCPYapeHtml.HTML_NBSP, Strings.SPACE)
        .replace(BCPYapeHtml.MULTIPLE_SPACES, Strings.SPACE)
        .trim();

    const merchantMatch = flattenedText.match(BCPYapeHtml.RECIPIENT_REGEX);
    if (!merchantMatch) {
        return Strings.EMPTY;
    }

    const merchant = merchantMatch[1].trim();
    return merchant;
}

export const BCPYapeMapper: IExpenseHtmlMapper = {

    supports(from: string, subject: string): boolean {
        return BCPPatterns.FROM_NOTIFICATIONS_YAPE.test(from) &&
            BCPYapeHtml.SUBJECT_REGEX.test(subject);
    },

    toEntity(bodyHtml: string): ExpenseEntity {
        const { amount, currency } = getAmountAndCurrency(bodyHtml);
        const merchant = getMerchant(bodyHtml);

        const expense = new ExpenseEntity();
        expense.amount = amount;
        expense.currency = currency;
        expense.source = "BCP - YAPE";
        expense.comments = merchant || Strings.EMPTY;
        return expense;
    }
};