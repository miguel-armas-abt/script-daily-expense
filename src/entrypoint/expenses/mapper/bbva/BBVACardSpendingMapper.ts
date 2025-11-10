import { ExpenseDto } from '../../dto/ExpenseDto';
import { AppConstants } from '../../constants/AppConstants';
import { NumberFormatter } from '../../utils/NumberFormatter';
import type { ExpenseBodyMapper } from '../ExpenseBodyMapper';
import { Currency, CurrencyConstants } from '../../enums/Currency';

function extractCurrency(bodyHtml: string): Currency {
  const currencyMatch = bodyHtml.match(/Moneda:\s*<\/p>\s*<p[^>]*>\s*([A-Z]{3})/i);
  if (currencyMatch) {
    const code = currencyMatch[1].toUpperCase();
    switch (code) {
      case 'PEN':
      case 'S/':
        return CurrencyConstants.CURRENCY_PEN;
      case 'USD':
      case 'US$':
        return CurrencyConstants.CURRENCY_USD;
    }
  }   
  return /\bS\/\b/i.test(bodyHtml) ? CurrencyConstants.CURRENCY_PEN : CurrencyConstants.CURRENCY_USD;
}

function extractMerchantName(bodyHtml: string): string {
  let merchantName: string = AppConstants.DEFAULT;
  const merchantMatch =
    bodyHtml.match(/Comercio\s*:?\s*<\/p>\s*<p[^>]*>\s*([^<]+)/i) ||
    bodyHtml.match(/Comercio\s*:?\s*<\/td>\s*<td[^>]*>\s*([^<]+)/i);

  if (merchantMatch && merchantMatch[1]) {
    merchantName = merchantMatch[1].replace(/&nbsp;|&#160;/gi, ' ').replace(/\s+/g, ' ').trim();
  } else {
    const normalizedBodyHtml = bodyHtml
      .replace(/<\s*\/?p[^>]*>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;|&#160;/gi, ' ')
      .replace(/\s+\n/g, '\n')
      .replace(/\n\s+/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .trim();

    const lines = normalizedBodyHtml.split(/\n+/);
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*Comercio\s*:?\s*$/i.test(lines[i])) {
        merchantName = (lines[i + 1] || '').trim();
        break;
      }
    }
  }
  return merchantName || AppConstants.DEFAULT;
}

export const BBVACardSpendingMapper: ExpenseBodyMapper = {
  supports(from: string, subject: string): boolean {
    return /procesos@bbva\.com\.pe/i.test(from) && /Has realizado.*consumo.*tarjeta\s*BBVA/i.test(subject);
  },
  toExpenseDto(bodyHtml: string): ExpenseDto {
    const amountText = bodyHtml.match(/Monto:\s*<\/p>\s*<p[^>]*>\s*([0-9]+(?:[.,][0-9]{2})?)/i);
    const amountNumber = NumberFormatter.parseNumber(amountText);
    const currency = extractCurrency(bodyHtml);
    const merchantName = extractMerchantName(bodyHtml);

    return new ExpenseDto({
      amount: amountNumber,
      currency,
      source: 'BBVA - TARJETA',
      comments: merchantName
    });
  }
};
