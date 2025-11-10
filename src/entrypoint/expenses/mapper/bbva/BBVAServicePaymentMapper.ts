import { ExpenseDto } from '../../dto/ExpenseDto';
import { AppConstants } from '../../constants/AppConstants';
import { NumberFormatter } from '../../utils/NumberFormatter';
import type { ExpenseBodyMapper } from '../ExpenseBodyMapper';
import { CurrencyConstants } from '../../enums/Currency';

function extractServiceName(bodyHtml: string): string {
  const serviceNameMatch = bodyHtml.match(/Nombre\s+(?:de\s+)?servicio<\/p>\s*<p[^>]*>\s*([^<]+)/i);
  const raw = (serviceNameMatch && serviceNameMatch[1]) || '';
  const clean = raw.replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
  return clean || AppConstants.DEFAULT;
}

export const BBVAServicePaymentMapper: ExpenseBodyMapper = {
  supports(from: string, subject: string): boolean {
    return /procesos@bbva\.com\.pe/i.test(from) && /Constancia Pago de servicios/i.test(subject);
  },
  toExpenseDto(bodyHtml: string): ExpenseDto {
    const amountText =
      bodyHtml.match(/Importe\s+pagado[^<]*?<[^>]*?>\s*S\/\s*([0-9]+(?:[.,][0-9]{2})?)/i) ||
      bodyHtml.match(/S\/\s*([0-9]+(?:[.,][0-9]{2})?)/i);
    const amountNumber = NumberFormatter.parseNumber(amountText);
    const serviceName = extractServiceName(bodyHtml);

    return new ExpenseDto({
      amount: amountNumber,
      currency: CurrencyConstants.CURRENCY_PEN,
      source: 'BBVA - SERVICIO',
      comments: serviceName
    });
  }
};
