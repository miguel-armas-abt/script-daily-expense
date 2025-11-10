/// <reference types="google-apps-script" />
import { AppConstants } from '../constants/AppConstants';
import { UtilDateTime } from '../utils/UtilDateTime';

type RepoExpense = {
  gmailMessageId: string;
  from?: string;
  subject?: string;
  source: string;
  kind: string;
  currency: string;
  amount: number;
  category?: string;
  comments?: string;
  expenseDate: any;
};

export const ExpenseRepository = (() => {
  function getSheet(): GoogleAppsScript.Spreadsheet.Sheet {
    const name =
      PropertiesService.getScriptProperties().getProperty(AppConstants.PROP_SHEET_NAME) ||
      AppConstants.DEFAULT_SHEET_NAME;

    const ss =
      SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create('PersonalExpensesDB');
    const sh = ss.getSheetByName(name) || ss.insertSheet(name);

    const headers = [
      'gmailMessageId',
      'checkedAt',
      'from',
      'subject',
      'source',
      'kind',
      'currency',
      'amount',
      'category',
      'comments',
      'expenseDate'
    ];

    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, headers.length).setValues([headers]);
      sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
    return sh;
  }

  function exists(gmailMessageId: string): boolean {
    if (!gmailMessageId) return false;
    const sheet = getSheet();
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return false;

    const range = sheet.getRange(2, 1, lastRow - 1, 1);
    const values = range.getValues();
    for (let i = 0; i < values.length; i++) {
      if (String(values[i][0]) === String(gmailMessageId)) return true;
    }
    return false;
  }

  function insert(expense: RepoExpense): string {
    const sheet = getSheet();
    const lock = LockService.getScriptLock();
    lock.tryLock(28 * 1000);
    try {
      if (exists(expense.gmailMessageId)) return expense.gmailMessageId;

      const row = [
        expense.gmailMessageId,
        UtilDateTime.nowCanonical(),
        expense.from || '',
        expense.subject || '',
        expense.source,
        expense.kind,
        expense.currency,
        expense.amount,
        expense.category || AppConstants.DEFAULT,
        expense.comments || '',
        expense.expenseDate
      ];
      sheet.appendRow(row);
      return expense.gmailMessageId;
    } finally {
      lock.releaseLock();
    }
  }

  function updateByGmailMessageId(
    gmailMessageId: string,
    newCategory: string,
    newComments: string,
    newAmount: number
  ): boolean {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === gmailMessageId) {
        sheet.getRange(i + 1, 9).setValue(newCategory);
        sheet.getRange(i + 1, 10).setValue(String(newComments).trim());
        sheet.getRange(i + 1, 8).setValue(Number(newAmount));
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
    range.sort([{ column: 11, ascending: false }]);
  }

  return { insert, updateByGmailMessageId, exists, sortByExpenseDateDesc };
})();
