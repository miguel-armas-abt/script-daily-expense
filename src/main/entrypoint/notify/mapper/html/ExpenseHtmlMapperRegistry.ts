import type { IExpenseHtmlMapper } from './IExpenseHtmlMapper';
import { BBVADebitCardMapper } from './bbva/BBVADebitCardMapper';
import { BBVAPlinMapper } from './bbva/BBVAPlinMapper';
import { BBVABusinessQRMapper } from './bbva/BBVAMerchantQRMapper';
import { BBVAServicePaymentMapper } from './bbva/BBVAServicePaymentMapper';
import { BCPCreditCardMapper } from './bcp/BCPCreditCardMapper';
import { BCPDebitCardMapper } from './bcp/BCPDebitCardMapper';
import { BCPYapeMapper } from './bcp/BCPYapeMapper';
import { BCPYapePaymentMapper } from './bcp/BCPYapeServiceMapper';

const MAPPERS: IExpenseHtmlMapper[] = [
  BBVADebitCardMapper,
  BBVAPlinMapper,
  BBVABusinessQRMapper,
  BBVAServicePaymentMapper,
  BCPCreditCardMapper,
  BCPDebitCardMapper,
  BCPYapeMapper,
  BCPYapePaymentMapper
];

export const MapperRegistry = (() => {
  function register(mapper: IExpenseHtmlMapper) {
    MAPPERS.push(mapper);
  }

  function getAll(): IExpenseHtmlMapper[] {
    return MAPPERS.slice();
  }

  return { register, getAll };
})();
