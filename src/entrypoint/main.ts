/// <reference types="google-apps-script" />
import { TriggerService } from './expenses/trigger/TriggerService';
import { ExpenseIdentifierService } from './expenses/service/ExpenseIdentifierService';
import { GmailRepository } from './expenses/repository/gmail/GmailRepository';
import { ExpenseRepository } from './expenses/repository/expense/ExpenseRepository';
import { Props } from './expenses/constants/Props';
import { TimeUtil } from './expenses/utils/TimeUtil';
import { Properties } from './expenses/config/Properties';

// === Helpers / Jobs ===
function setup(): void {
  TriggerService.createTimeTriggerEveryMinutes('runExpenseIngestion');
}

function runExpenseIngestion(): void {
  ExpenseIdentifierService.findConstanciesAndPersist();
}

function testMail(): void {
  GmailRepository.sendEmail(
    'miguel.armas.abt@gmail.com',
    'Categorizar gasto',
    '<h1>Hello</h1>');
}

function sortSheet(): void {
  ExpenseRepository.sortByExpenseDateDesc();
}

function lastCheckDate(): void {
  Properties.set(
    Props.LAST_CHECK_DATE,
    TimeUtil.now()
  );
}

function generateUUID(): void {
  const uuid = Utilities.getUuid();
  Logger.log(uuid);
}

// === Expone en global (GAS necesita funciones globales) ===
(globalThis as any).setup = setup;
(globalThis as any).runExpenseIngestion = runExpenseIngestion;
(globalThis as any).testMail = testMail;
(globalThis as any).sortSheet = sortSheet;
(globalThis as any).lastCheckDate = lastCheckDate;
(globalThis as any).generateUUID = generateUUID;
