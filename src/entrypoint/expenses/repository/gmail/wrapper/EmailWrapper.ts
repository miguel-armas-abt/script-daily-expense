import { Strings } from "../../../constants/Strings";

export type EmailWrapperArgs = {
    gmailMessageId: string;
    date: Date;
    from: string;
    subject: string;
    bodyHtml?: string;
};

export class EmailWrapper {
    gmailMessageId: string;
    date: Date;
    from: string;
    subject: string;
    bodyHtml: string;

    constructor(args: EmailWrapperArgs) {
        this.gmailMessageId = args.gmailMessageId;
        this.date = args.date;
        this.from = args.from;
        this.subject = args.subject;
        this.bodyHtml = args.bodyHtml || Strings.EMPTY;
    }
}
