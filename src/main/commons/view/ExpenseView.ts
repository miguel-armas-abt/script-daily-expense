/// <reference types="google-apps-script" />
import { Categories } from '../constants/Categories';
import { DateConstants } from '../constants/DateConstants';
import { Strings } from '../constants/Strings';
import { WebActions } from '../constants/WebAction';

const ExpenseView = (() => {

  function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.HTML.HtmlOutput {
    const params = (e && e.parameter) || ({} as Record<string, string>);
    const action = params.action || WebActions.SEARCH;

    const tpl = HtmlService.createTemplateFromFile('Index');
    tpl.categories = Categories.DEFAULT_CATEGORIES;
    tpl.defaultDate = Utilities.formatDate(new Date(), DateConstants.TIME_ZONE, 'yyyy-MM-dd');
    tpl.initialTab = action;

    tpl.gmailMessageId = params.gmailMessageId || Strings.EMPTY;
    tpl.amount        = params.amount || Strings.EMPTY;
    tpl.expenseDate   = params.expenseDate || Strings.EMPTY;
    tpl.source        = params.source || Strings.EMPTY;
    tpl.kind          = params.kind || Strings.EMPTY;
    tpl.comments      = params.comments || Strings.EMPTY;
    tpl.category      = params.category || Strings.EMPTY;

    return tpl
      .evaluate()
      .setTitle('Gestión de gastos');
  }

  return { doGet: doGet };
})();

export default ExpenseView;