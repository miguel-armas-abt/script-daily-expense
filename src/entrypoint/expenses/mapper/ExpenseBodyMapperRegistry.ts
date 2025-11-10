import type { ExpenseBodyMapper } from './ExpenseBodyMapper';
import { BBVACardSpendingMapper } from './bbva/BBVACardSpendingMapper';
import { BBVAPlinMapper } from './bbva/BBVAPlinMapper';
import { BBVAQRMapper } from './bbva/BBVAQRMapper';
import { BBVAServicePaymentMapper } from './bbva/BBVAServicePaymentMapper';
import { IBKPlinMapper } from './ibk/IBKPlinMapper';

const MAPPERS: ExpenseBodyMapper[] = [
  BBVACardSpendingMapper,
  BBVAPlinMapper,
  BBVAQRMapper,
  BBVAServicePaymentMapper,
  IBKPlinMapper
];

export const MapperRegistry = (() => {
  function register(mapper: ExpenseBodyMapper) {
    MAPPERS.push(mapper);
  }

  function getAll(): ExpenseBodyMapper[] {
    return MAPPERS.slice();
  }

  return { register, getAll };
})();
