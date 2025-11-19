import { CurrencyCodes } from '../../../../../commons/constants/Currency';
import { Strings } from '../../../../../commons/constants/Strings';
import { ExpenseEntity } from '../../../../../commons/repository/expense/entity/ExpenseEntity';
import { NumberFormatter } from '../../../utils/NumberFormatter';
import type { IExpenseHtmlMapper } from '../IExpenseHtmlMapper';

function extractServiceName(bodyHtml: string): string {
  const serviceNameMatch = bodyHtml.match(/Nombre\s+(?:de\s+)?servicio<\/p>\s*<p[^>]*>\s*([^<]+)/i);
  const raw = (serviceNameMatch && serviceNameMatch[1]) || '';
  const clean = raw.replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
  return clean || Strings.EMPTY;
}

export const BBVAServicePaymentMapper: IExpenseHtmlMapper = {

  supports(from: string, subject: string): boolean {
    return /procesos@bbva\.com\.pe/i.test(from) && /Constancia Pago de servicios/i.test(subject);
  },

  toEntity(bodyHtml: string): ExpenseEntity {
    const amountText =
      bodyHtml.match(/Importe\s+pagado[^<]*?<[^>]*?>\s*S\/\s*([0-9]+(?:[.,][0-9]{2})?)/i) ||
      bodyHtml.match(/S\/\s*([0-9]+(?:[.,][0-9]{2})?)/i);
    const amountNumber = NumberFormatter.parseNumber(amountText);
    const serviceName = extractServiceName(bodyHtml);

    let expense = new ExpenseEntity();
    expense.amount = amountNumber;
    expense.currency = CurrencyCodes.PEN;
    expense.source = 'BBVA - SERVICIO';
    expense.comments = serviceName;
    return expense;
  }
};
