export const CurrencyCodes = Object.freeze({
    PEN: "PEN",
    USD: "USD",
} as const)

export type Currency = keyof typeof CurrencyCodes;

export const CurrencySymbols: Record<Currency, string> = Object.freeze({
    PEN: "S/",
    USD: "$",
})