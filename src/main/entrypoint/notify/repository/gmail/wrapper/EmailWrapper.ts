export class EmailWrapper {
    gmailMessageId?: string;
    date?: string;
    from?: string;
    subject?: string;
    bodyHtml?: string;

    constructor(init?: Partial<EmailWrapper>) {
        Object.assign(this, init);
    }
}
