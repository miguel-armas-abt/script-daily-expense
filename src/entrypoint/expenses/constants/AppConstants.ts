export const AppConstants = Object.freeze({
  DEFAULT: 'Default',
  PROP_TIMEZONE: 'app.timezone',
  PROP_TRIGGER_EVERY_MINUTES: 'app.trigger.every.minutes',
  PROP_WEBAPP_BASE_URL: 'app.webapp.base.url',
  PROP_FORWARD_TO_EMAIL: 'app.forward.to.email',
  PROP_SHEET_NAME: 'app.sheet.name',
  PROP_SEND_EMAIL: 'app.send.email',
  PROP_LAST_CHECK_TIMESTAMP_ISO_UTC: 'timestamp.last-check.iso-utc',

  CURRENCY_PEN: 'PEN' as const,
  CURRENCY_USD: 'USD' as const,

  MANUALLY: 'MANUAL',

  DEFAULT_TIMEZONE: 'America/Lima',
  DEFAULT_TRIGGER_MINUTES: 5,
  DEFAULT_SHEET_NAME: 'personalDailyExpenses',

  GMAIL_QUERIES: [
    'from:procesos@bbva.com.pe subject:"Constancia de operación transferencia PLIN"',
    'from:servicioalcliente@netinterbank.com.pe subject:"Constancia de Pago Plin"',
    'from:procesos@bbva.com.pe subject:"Constancia de pago a comercios con QR"',
    'from:procesos@bbva.com.pe subject:"Has realizado un consumo con tu tarjeta BBVA"',
    'from:procesos@bbva.com.pe subject:"BBVA - Constancia Pago de servicios"'
  ],

  DEFAULT_CATEGORIES: [
    'OCIO Y ENTRETENIMIENTO',
    'TAXI',
    'PAREJA',
    'COMIDA Y HOGAR',
    'SERVICIOS',
    'BIENES',
    'EDUCACIÓN',
    'SALUD',
    'CONSTRUCCIÓN'
  ]
});
export type Currency = typeof AppConstants.CURRENCY_PEN | typeof AppConstants.CURRENCY_USD;
