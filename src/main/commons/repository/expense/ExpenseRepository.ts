/// <reference types="google-apps-script" />
import { Properties } from '../../config/Properties';
import { Props } from '../../constants/Props';
import { Strings } from '../../constants/Strings';
import { ExpenseEntity } from './entity/ExpenseEntity';
import { TimeUtil } from '../../utils/TimeUtil';
import { Currency } from '../../constants/Currency';
import { ExpenseIndex } from './entity/ExpenseIndex';

export const ExpenseRepository = (() => {

  function getSheet(): GoogleAppsScript.Spreadsheet.Sheet {
    const sheetName = Properties.get(Props.SHEET_NAME)

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);

    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, ExpenseIndex.HEADERS.length).setValues([ [...ExpenseIndex.HEADERS] ]);
      sh.getRange(1, 1, 1, ExpenseIndex.HEADERS.length).setFontWeight('bold');
    }
    return sh;
  }

  function exists(gmailMessageId: string): boolean {
    if (!gmailMessageId) return false;
    const sheet = getSheet();
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return false;

    const range = sheet.getRange(2, ExpenseIndex.HEADERS_MAP.gmailMessageId, lastRow - 1, 1);
    const values = range.getValues();
    for (let i = 0; i < values.length; i++) {
      if (String(values[i][0]) === String(gmailMessageId)) return true;
    }
    return false;
  }

  function insert(expense: ExpenseEntity): string {
    if (!expense.gmailMessageId)
      throw new Error('[insert][repository] The field is required: gmailMessageId');

    if (!expense.source)
      throw new Error('[insert][repository] The field is required: source');

    if (!expense.currency)
      throw new Error('[insert][repository] The field is required: currency');

    if (!expense.amount)
      throw new Error('[insert][repository] The field is required: amount');

    if (!expense.category)
      throw new Error('[insert][repository] The field is required: category');

    if (!expense.expenseDate)
      throw new Error('[insert][repository] The field is required: expenseDate');

    const sheet = getSheet();
    const lock = LockService.getScriptLock();
    lock.tryLock(28 * 1000);

    try {
      if (exists(expense.gmailMessageId))
        throw new Error('[insert][repository] expense record already exists: ' + expense.gmailMessageId)

      const row = [
        expense.gmailMessageId,
        expense.checkedAt || TimeUtil.nowUtcString(),
        expense.source,
        expense.currency,
        expense.amount,
        expense.category,
        expense.comments || Strings.EMPTY,
        expense.expenseDate
      ];
      sheet.appendRow(row);
      return expense.gmailMessageId;
    } finally {
      lock.releaseLock();
    }
  }

  function updateByGmailMessageId(expense: ExpenseEntity): boolean {
    if (!expense.gmailMessageId)
      throw new Error('[update][repository] The field is required: gmailMessageId');

    if (!expense.category)
      throw new Error('[update][repository] The field is required: category');

    if (!expense.amount)
      throw new Error('[update][repository] The field is required: amount');

    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      const gmailColIndex = ExpenseIndex.HEADERS_MAP.gmailMessageId - 1;
      if (data[i][gmailColIndex] === expense.gmailMessageId) {
        sheet.getRange(i + 1, ExpenseIndex.HEADERS_MAP.amount).setValue(Number(expense.amount));
        sheet.getRange(i + 1, ExpenseIndex.HEADERS_MAP.category).setValue(expense.category);

        if(expense.comments) {
          sheet.getRange(i + 1, ExpenseIndex.HEADERS_MAP.comments).setValue(String(expense.comments).trim());
        }
        
        return true;
      }
    }
    return false;
  }

  function sortByExpenseDateDesc(): void {
    const sheet = getSheet();
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow <= 1) return;
    const range = sheet.getRange(2, 1, lastRow - 1, lastCol);
    range.sort([{ column: ExpenseIndex.HEADERS_MAP.expenseDate, ascending: false }]);
  }

  function findAll(): ExpenseEntity[] {
    const sheet = getSheet();
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return [];

    const values = sheet.getRange(2, 1, lastRow - 1, ExpenseIndex.HEADERS.length).getValues();

    return values.map(r => new ExpenseEntity({
      gmailMessageId: String(r[ExpenseIndex.HEADERS_MAP.gmailMessageId - 1] ?? Strings.EMPTY),
      checkedAt: String(r[ExpenseIndex.HEADERS_MAP.checkedAt - 1] ?? Strings.EMPTY),
      source: String(r[ExpenseIndex.HEADERS_MAP.source - 1] ?? Strings.EMPTY),
      currency: String(r[ExpenseIndex.HEADERS_MAP.currency - 1] ?? Strings.EMPTY) as Currency,
      amount: Number(r[ExpenseIndex.HEADERS_MAP.amount - 1] ?? 0.0),
      category: String(r[ExpenseIndex.HEADERS_MAP.category - 1] ?? Strings.EMPTY),
      comments: String(r[ExpenseIndex.HEADERS_MAP.comments - 1] ?? Strings.EMPTY),
      expenseDate: String(r[ExpenseIndex.HEADERS_MAP.expenseDate - 1] ?? Strings.EMPTY),
    }));
  }

  return {
    insert,
    updateByGmailMessageId,
    exists,
    sortByExpenseDateDesc,
    findAll: findAll
  };
})();
