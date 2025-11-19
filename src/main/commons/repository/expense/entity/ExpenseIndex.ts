export const ExpenseIndex = (() => {

    const HEADERS = [
        'gmailMessageId',
        'checkedAt',
        'source',
        'currency',
        'amount',
        'category',
        'comments',
        'expenseDate'
    ] as const;

    type HeaderKey = typeof HEADERS[number];

    const HEADERS_MAP: Record<HeaderKey, number> = HEADERS.reduce((acc, key, idx) => {
        acc[key] = idx + 1;
        return acc;
    }, {} as Record<HeaderKey, number>);

  return {
    HEADERS_MAP: HEADERS_MAP,
    HEADERS
  };
})();