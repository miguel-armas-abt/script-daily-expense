/// <reference types="google-apps-script" />
import { AppConstants } from '../constants/AppConstants';

export const Mailer = (() => {
  function buildWebAppUrl(params: Record<string, string | number>) {
    const baseUrl =
      PropertiesService.getScriptProperties().getProperty(AppConstants.PROP_WEBAPP_BASE_URL) || '';
    if (!baseUrl) return '';

    const queryParams = Object.keys(params)
      .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(String(params[k])))
      .join('&');

    return baseUrl + (baseUrl.indexOf('?') > -1 ? '&' : '?') + queryParams;
  }

  function sendCategorizeMail(
    to: string,
    payload: {
      gmailMessageId: string;
      amount?: number | string;
      expenseDate?: string;
      source?: string;
      kind?: string;
      comments?: string;
    }
  ) {
    const url = buildWebAppUrl({
      action: 'edit',
      gmailMessageId: payload.gmailMessageId,
      amount: payload.amount || '',
      expenseDate: payload.expenseDate || '',
      source: payload.source || '',
      kind: payload.kind || '',
      comments: payload.comments || ''
    });

    const html =
      [
        '<div style="font-family:Arial,Helvetica,sans-serif">',
        '<p><b>Importe:</b> ',
        payload.amount || '',
        '<br>',
        '<b>Fecha:</b> ',
        payload.expenseDate || '',
        '<br>',
        '<b>Origen:</b> ',
        payload.source || '',
        ' (',
        payload.kind || '',
        ')</p>',
        '<b>Destino:</b> ',
        payload.comments || '',
        '<br>',
        '<p>',
        '<a href="',
        url,
        `" style="display:inline-block;padding:10px 16px;border-radius:6px;background:#1973b8;color:#fff;text-decoration:none;font-weight:bold" target="_blank">`,
        'Elegir categoría</a>',
        '</p>',
        '</div>'
      ].join('');

    const subject =
      'Categoría de gasto - ' + (payload.source || '') + ' ' + (payload.kind || '') + ' ' + payload.amount;

    GmailApp.sendEmail(to, subject, 'Da clic en el botón para seleccionar la categoría', {
      htmlBody: html
    });
  }

  return { sendCategorizeMail };
})();
