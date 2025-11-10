export const UtilNumberFormatter = (() => {
  function parseNumber(textMatch: RegExpMatchArray | null): number | null {
    const n = textMatch ? Number(textMatch[1]) : null;
    return n != null && !Number.isNaN(n) ? n : null;
  }
  return { parseNumber };
})();
