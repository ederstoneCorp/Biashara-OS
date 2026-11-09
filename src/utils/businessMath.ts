/**
 * Financial and inventory calculations for BiasharaOS
 */

export interface FinancialSummaryInput {
  salesTotal: number;
  costOfGoodsSold: number;
  expensesTotal: number;
}

export interface FinancialSummaryResult {
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMarginPct: number;
  expenses: number;
  netProfit: number;
  netMarginPct: number;
}

/**
 * Calculates Gross Profit, Net Profit, and respective margin percentages.
 */
export function calculateFinancialSummary(input: FinancialSummaryInput): FinancialSummaryResult {
  const { salesTotal, costOfGoodsSold, expensesTotal } = input;
  const grossProfit = salesTotal - costOfGoodsSold;
  const grossMarginPct = salesTotal > 0 ? (grossProfit / salesTotal) * 100 : 0;
  const netProfit = grossProfit - expensesTotal;
  const netMarginPct = salesTotal > 0 ? (netProfit / salesTotal) * 100 : 0;

  return {
    revenue: salesTotal,
    cogs: costOfGoodsSold,
    grossProfit,
    grossMarginPct: Math.round(grossMarginPct * 10) / 10,
    expenses: expensesTotal,
    netProfit,
    netMarginPct: Math.round(netMarginPct * 10) / 10,
  };
}

/**
 * Calculates total valuation of inventory at cost price and at selling price.
 */
export function calculateInventoryValuation(products: Array<{ costPrice: number; sellingPrice: number; stockQuantity: number }>) {
  let totalCostValue = 0;
  let totalRetailValue = 0;
  let totalUnits = 0;

  for (const item of products) {
    const qty = Math.max(0, item.stockQuantity);
    totalCostValue += item.costPrice * qty;
    totalRetailValue += item.sellingPrice * qty;
    totalUnits += qty;
  }

  const potentialGrossProfit = totalRetailValue - totalCostValue;

  return {
    totalUnits,
    totalCostValue,
    totalRetailValue,
    potentialGrossProfit,
  };
}

/**
 * Calculates staff commission on attributed sales total.
 */
export function calculateStaffCommission(salesTotal: number, ratePercentStr: string): number {
  const rate = parseFloat(ratePercentStr) || 0;
  if (rate <= 0 || salesTotal <= 0) return 0;
  return Math.round((salesTotal * rate) / 100);
}

/**
 * Validates and formats Kenyan Shilling currency string (e.g. "KES 145,000")
 */
export function formatKES(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(amount);
}
