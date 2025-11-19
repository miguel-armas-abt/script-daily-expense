import { Strings } from '../../../commons/constants/Strings.js';
import { GmailRepository } from '../repository/gmail/GmailRepository.js';
import { Props } from '../../../commons/constants/Props.js';
import { ExpenseEntity } from '../../../commons/repository/expense/entity/ExpenseEntity.js';
import { Properties } from '../../../commons/config/Properties.js';
import { TimeUtil } from '../../../commons/utils/TimeUtil.js';
import { WebActions } from '../../../commons/constants/WebAction.js';

export const ExpenseNotifierService = (() => {

    function buildURL(params: Record<string, string | number>) {
        const baseUrl = Properties.get(Props.WEBAPP_BASE_URL);

        const queryParams = Object.keys(params)
            .map((key) => encodeURIComponent(key) + Strings.EQUAL + encodeURIComponent(String(params[key])))
            .join(Strings.AMPERSAND);

        return baseUrl
            + (baseUrl.indexOf(Strings.QUESTION_MARK) > -1 ? Strings.AMPERSAND : Strings.QUESTION_MARK)
            + queryParams;
    }

    function sendEmail(to: string, expense: ExpenseEntity) {
        if(!expense.gmailMessageId)
            throw new Error('[sendEmail][notifier] The field is required: gmailMessageId')

        if(!expense.amount)
            throw new Error('[sendEmail][notifier] The field is required: amount')

        if(!expense.source)
            throw new Error('[sendEmail][notifier] The field is required: source')

        if(!expense.expenseDate)
            throw new Error('[sendEmail][notifier] The field is required: expenseDate')

        const expenseDate = TimeUtil.toTimeZoneString(expense.expenseDate);
        const url = buildURL({
            action: WebActions.UPDATE,
            gmailMessageId: expense.gmailMessageId,
            amount: expense.amount,
            expenseDate: expenseDate,
            source: expense.source,
            comments: expense.comments || Strings.EMPTY,
        });

        const html =
            [
                '<div style="font-family:Arial,Helvetica,sans-serif">',
                '<p><b>Importe:</b> ',
                expense.amount,
                '<br>',
                '<b>Fecha:</b> ',
                expenseDate,
                '<br>',
                '<b>Origen:</b> ',
                expense.source,
                '<br>',
                '<b>Destino:</b> ',
                expense.comments || Strings.EMPTY,
                '<br>',
                '<p>',
                '<a href="',
                url,
                `" style="display:inline-block;padding:10px 16px;border-radius:6px;background:#1973b8;color:#fff;text-decoration:none;font-weight:bold" target="_blank">`,
                'Elegir categoría</a>',
                '</p>',
                '</div>'
            ].join('');

        const subject = 'Categoría de gasto - '
            + expense.source + Strings.SPACE
            + expense.amount;

        GmailRepository.sendEmail(to, subject, html);
    }

    return { sendEmail };
})();