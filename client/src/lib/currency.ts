const currencyInfo: Record<string, string> = {
  USD: "$",
  MXN: "MX$",
  DOP: "RD$",
};

export function getCurrencySymbol(moneda: string): string {
  return currencyInfo[moneda] ?? "$";
}

export function formatPrice(monto: number, moneda: string): string {
  const symbol = getCurrencySymbol(moneda);
  return `${symbol}${monto.toFixed(2)}`;
}
