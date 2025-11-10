/// <reference types="google-apps-script" />
import { Properties } from '../../config/Properties';
import { Props } from '../../constants/Props';
import { AppConstants } from '../../constants/AppConstants';
import { Strings } from '../../constants/Strings';
import { ExpenseDto } from '../../dto/ExpenseDto';
import { TimeUtil } from '../../utils/TimeUtil';
import { EmailWrapper } from '../gmail/wrapper/EmailWrapper';

export const ExpenseRepository = (() => {
  function getSheet(): GoogleAppsScript.Spreadsheet.Sheet {
    const sheetName = Properties.get(Props.SHEET_NAME)

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);

    const headers = [
      'gmailMessageId',
      'checkedAt',
      'source',
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

  function insert(expense: ExpenseDto, date: Date): string {
    const sheet = getSheet();
    const lock = LockService.getScriptLock();
    lock.tryLock(28 * 1000);
    try {
      if (exists(expense.gmailMessageId)) return expense.gmailMessageId;

      const row = [
        expense.gmailMessageId,
        TimeUtil.now(),
        expense.source,
        expense.currency,
        expense.amount,
        expense.category || AppConstants.DEFAULT,
        expense.comments || Strings.EMPTY,
        TimeUtil.toString(date)
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
        sheet.getRange(i + 1, 5).setValue(Number(newAmount));
        sheet.getRange(i + 1, 6).setValue(newCategory);
        sheet.getRange(i + 1, 7).setValue(String(newComments).trim());
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
    range.sort([{ column: 8, ascending: false }]);
  }

  return { insert, updateByGmailMessageId, exists, sortByExpenseDateDesc };
})();
