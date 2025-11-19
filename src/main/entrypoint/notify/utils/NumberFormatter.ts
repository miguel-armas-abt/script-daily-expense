export const NumberFormatter = (() => {

  function parseNumber(textMatch: RegExpMatchArray | null): number {
    const numberStr = textMatch ? Number(textMatch[1]) : null;
    return numberStr != null && !Number.isNaN(numberStr) ? numberStr : 0.0;
  }

  return { parseNumber };
})();
