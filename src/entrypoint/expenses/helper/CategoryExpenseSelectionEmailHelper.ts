import { Strings } from '../constants/Strings.js';
import { GmailRepository } from '../repository/gmail/GmailRepository.js';
import { Props } from '../constants/Props.js';
import { ExpenseDto } from '../dto/ExpenseDto.js';
import { Properties } from '../config/Properties.js';
import { TimeUtil } from '../utils/TimeUtil.js';

export const CategoryExpenseSelectionEmailHelper = (() => {

    function buildURL(params: Record<string, string | number>) {
        const baseUrl = Properties.get(Props.WEBAPP_BASE_URL);

        const queryParams = Object.keys(params)
            .map((key) => encodeURIComponent(key) + Strings.EQUAL + encodeURIComponent(String(params[key])))
            .join(Strings.AMPERSAND);

        return baseUrl
            + (baseUrl.indexOf(Strings.QUESTION_MARK) > -1 ? Strings.AMPERSAND : Strings.QUESTION_MARK)
            + queryParams;
    }

    function sendEmail(to: string, expense: ExpenseDto, date: Date) {

        const expenseDate = TimeUtil.toString(date);

        const url = buildURL({
            action: 'edit',
            gmailMessageId: expense.gmailMessageId,
            amount: expense.amount || Strings.EMPTY,
            expenseDate: expenseDate,
            source: expense.source || Strings.EMPTY,
            comments: expense.comments || Strings.EMPTY,
        });

        const html =
            [
                '<div style="font-family:Arial,Helvetica,sans-serif">',
                '<p><b>Importe:</b> ',
                expense.amount || Strings.EMPTY,
                '<br>',
                '<b>Fecha:</b> ',
                expenseDate,
                '<br>',
                '<b>Origen:</b> ',
                expense.source || Strings.EMPTY,
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