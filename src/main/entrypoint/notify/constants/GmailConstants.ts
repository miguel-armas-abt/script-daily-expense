import { BBVA } from "./BBVA";
import { BCP } from "./BCP";
import { IBK } from "./IBK";

export const GmailConstants = Object.freeze({

  GMAIL_QUERIES: [
    `from:${BBVA.FROM_PROCESSES} subject:"${BBVA.SUBJECT_PLIN}"`,
    `from:${IBK.FROM_CUSTOMER_SERVICE} subject:"${IBK.SUBJECT_PLIN}"`,
    `from:${BBVA.FROM_PROCESSES} subject:"${BBVA.SUBJECT_MERCHANT_QR}"`,
    `from:${BBVA.FROM_PROCESSES} subject:"${BBVA.SUBJECT_DEBIT_CARD}"`,
    `from:${BBVA.FROM_PROCESSES} subject:"${BBVA.SUBJECT_SERVICE_PAYMENT}"`,
    `from:${BCP.FROM_NOTIFICATIONS} subject:"${BCP.SUBJECT_DEBIT_CARD}"`,
    `from:${BCP.FROM_NOTIFICATIONS} subject:"${BCP.SUBJECT_CREDIT_CARD}"`,
    `from:${BCP.FROM_NOREPLY_YAPE} subject:"${BCP.SUBJECT_YAPE_SERVICE}"`,
    `from:${BCP.FROM_NOTIFICATIONS_YAPE} subject:"${BCP.SUBJECT_YAPE}"`,
  ],
});


