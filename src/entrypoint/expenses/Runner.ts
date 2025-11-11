/// <reference types="google-apps-script" />
import { TriggerService } from './trigger/TriggerService';
import { ExpenseIdentifierService } from './service/ExpenseIdentifierService';
import { GmailRepository } from './repository/gmail/GmailRepository';
import { ExpenseRepository } from './repository/expense/ExpenseRepository';
import { Props } from './constants/Props';
import { TimeUtil } from './utils/TimeUtil';
import { Properties } from './config/Properties';

export function createTrigger(): void {
  TriggerService.createTimeTriggerEveryMinutes('findConstanciesAndPersist');
}

export function findConstanciesAndPersist(): void {
  ExpenseIdentifierService.findConstanciesAndPersist();
}

export function sendEmail(): void {
  GmailRepository.sendEmail('miguel.armas.abt@gmail.com', 'Categorizar gasto', '<h1>Hello</h1>');
}

export function sortExpenses(): void {
  ExpenseRepository.sortByExpenseDateDesc();
}

export function setLastCheckDate(): void {
  Properties.set(Props.LAST_CHECK_DATE, TimeUtil.now());
}
