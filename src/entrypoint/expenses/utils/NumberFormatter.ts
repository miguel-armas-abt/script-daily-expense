export const NumberFormatter = (() => {

  function parseNumber(textMatch: RegExpMatchArray | null): number | null {
    const numberStr = textMatch ? Number(textMatch[1]) : null;
    return numberStr != null && !Number.isNaN(numberStr) ? numberStr : null;
  }

  return { parseNumber };
})();
