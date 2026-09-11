export function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function calculateBoxProfit(buyPrice: number, sellPrice: number): number {
  return roundCurrency(sellPrice - buyPrice);
}

export function calculateUnitPrices(buyPriceBox: number, sellPriceBox: number, itemsPerBox: number) {
  if (itemsPerBox <= 0) throw new Error("عدد القطع في العلبة يجب أن يكون اكبر من صفر");
  
  const buyPricePiece = roundCurrency(buyPriceBox / itemsPerBox);
  const sellPricePiece = roundCurrency(sellPriceBox / itemsPerBox);
  const pieceProfit = roundCurrency(sellPricePiece - buyPricePiece);
  
  return {
    buyPricePiece,
    sellPricePiece,
    pieceProfit,
  };
}

export function calculateProfitPercentage(buyPrice: number, profit: number): number {
  if (buyPrice <= 0) return 0;
  return roundCurrency((profit / buyPrice) * 100);
}

export function calculateInventoryItemValue(fullBoxes: number, boxBuyPrice: number, looseItems: number, pieceBuyPrice: number): number {
  const boxesValue = fullBoxes * boxBuyPrice;
  const looseValue = looseItems * pieceBuyPrice;
  return roundCurrency(boxesValue + looseValue);
}

export function calculateNetProfit(totalRevenue: number, totalExpenses: number): number {
  return roundCurrency(totalRevenue - totalExpenses);
}