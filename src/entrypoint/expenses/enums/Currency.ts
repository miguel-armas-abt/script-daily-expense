export const CurrencyConstants = Object.freeze({

    CURRENCY_PEN: 'PEN' as const,
    CURRENCY_USD: 'USD' as const,
});

export type Currency = typeof CurrencyConstants.CURRENCY_PEN | typeof CurrencyConstants.CURRENCY_USD;