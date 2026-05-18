import { Asset, CalculatedKPIs, PricingInfo, SpecInfo, ROIInputs } from './types';

// Buyer premium: 16% of current bid
export function calculateBuyerPremium(bid: number): number {
  return Math.round(bid * 0.16);
}

// Taxes: 21% VAT on (bid + premium) — with flag for export exemption
export function calculateTaxes(bid: number, premium: number, exportExempt = false): number {
  if (exportExempt) return 0;
  return Math.round((bid + premium) * 0.21);
}

// Transport: realistic European industrial shipping
// Base €800 + €1.2/km estimated (using rough distance from central Europe)
export function calculateTransport(weightKg: number, country: string): number {
  const distanceMap: Record<string, number> = {
    ES: 1200, DE: 300, NL: 500, FR: 800, IT: 900, UK: 1000, US: 0, CZ: 600, PL: 800, BE: 400
  };
  const distance = distanceMap[country] || 1000;
  const baseCost = 800;
  const distanceCost = distance * 1.2;
  const weightSurcharge = weightKg > 5000 ? Math.round((weightKg - 5000) * 0.15) : 0;
  return Math.round(baseCost + distanceCost + weightSurcharge);
}

// Refurbishment cost based on condition
export function calculateRefurbishment(condition: string): number {
  switch (condition) {
    case 'excellent': return 2000;
    case 'good': return 5000;
    case 'fair': return 12000;
    case 'poor': return 25000;
    default: return 15000;
  }
}

// Calculate ALL KPIs for an asset
export function calculateKPIs(pricing: PricingInfo, specs: SpecInfo, countryCode: string): CalculatedKPIs {
  // Use currentBid if available, fallback to startingBid
  const bid = pricing.currentBid || pricing.startingBid || 0;
  const resale = pricing.estimatedResale || 0;

  if (bid <= 0 || resale <= 0) {
    return emptyKPIs();
  }

  const buyerPremium = calculateBuyerPremium(bid);
  const taxes = calculateTaxes(bid, buyerPremium);
  const transport = calculateTransport(specs.weight || 2000, countryCode);
  const refurbishment = calculateRefurbishment(specs.condition);
  const fixed = 500; // administrative/legal fees

  const totalAcquisitionCost = bid + buyerPremium + taxes + transport + refurbishment + fixed;
  const grossProfit = resale - totalAcquisitionCost;
  const roi = totalAcquisitionCost > 0 ? (grossProfit / totalAcquisitionCost) * 100 : 0;
  const netProfitMargin = resale > 0 ? (grossProfit / resale) * 100 : 0;

  // Payback: months to recover investment from monthly profit
  // Assume 12-month holding period, profit spread evenly
  const holdingMonths = 12;
  const monthlyProfit = grossProfit > 0 ? grossProfit / holdingMonths : 0;
  const paybackMonths = monthlyProfit > 0 ? Math.ceil(totalAcquisitionCost / monthlyProfit) : 999;

  // TIR (IRR): simplified compound return
  const tir = paybackMonths > 0 && paybackMonths < 999
    ? (Math.pow(1 + roi / 100, 12 / paybackMonths) - 1) * 100
    : 0;

  const arbitrageScore = totalAcquisitionCost > 0 ? resale / totalAcquisitionCost : 0;

  // Risk score: weighted composite (0-100)
  let riskScore = 20; // base
  riskScore += specs.condition === 'excellent' ? 25 : specs.condition === 'good' ? 15 : specs.condition === 'fair' ? 5 : 0;
  riskScore += arbitrageScore >= 1.5 ? 20 : arbitrageScore >= 1.2 ? 10 : 0;
  riskScore += pricing.hasReserve ? 5 : 0;
  riskScore += specs.year && specs.year >= 2015 ? 10 : specs.year && specs.year >= 2010 ? 5 : 0;
  riskScore = Math.min(riskScore, 100);

  const riskLevel = riskScore >= 65 ? 'low' : riskScore >= 40 ? 'medium' : 'high';

  return {
    totalAcquisitionCost,
    buyerPremium,
    taxes,
    transport,
    refurbishment,
    estimatedResaleValue: resale,
    grossProfit,
    roi: Math.round(roi * 10) / 10,
    netProfitMargin: Math.round(netProfitMargin * 10) / 10,
    paybackMonths: Math.min(paybackMonths, 999),
    tir: Math.round(tir * 10) / 10,
    arbitrageScore: Math.round(arbitrageScore * 100) / 100,
    isGanga: arbitrageScore >= 1.5,
    riskScore,
    riskLevel
  };
}

function emptyKPIs(): CalculatedKPIs {
  return {
    totalAcquisitionCost: 0, buyerPremium: 0, taxes: 0, transport: 0,
    refurbishment: 0, estimatedResaleValue: 0, grossProfit: 0,
    roi: 0, netProfitMargin: 0, paybackMonths: 999, tir: 0,
    arbitrageScore: 0, isGanga: false, riskScore: 0, riskLevel: 'high'
  };
}

// ROI Simulator calculation
export function calculateROI(inputs: ROIInputs): CalculatedKPIs {
  const { investment, logisticsCost, estimatedResale } = inputs;
  const totalAcquisitionCost = investment + logisticsCost + 500;
  const grossProfit = estimatedResale - totalAcquisitionCost;
  const roi = totalAcquisitionCost > 0 ? (grossProfit / totalAcquisitionCost) * 100 : 0;
  const netProfitMargin = estimatedResale > 0 ? (grossProfit / estimatedResale) * 100 : 0;
  const monthlyProfit = grossProfit > 0 ? grossProfit / 12 : 0;
  const paybackMonths = monthlyProfit > 0 ? Math.ceil(totalAcquisitionCost / monthlyProfit) : 999;
  const tir = paybackMonths > 0 && paybackMonths < 999
    ? (Math.pow(1 + roi / 100, 12 / paybackMonths) - 1) * 100 : 0;
  const arbitrageScore = totalAcquisitionCost > 0 ? estimatedResale / totalAcquisitionCost : 0;
  const riskScore = Math.min(20 + (arbitrageScore >= 1.5 ? 40 : arbitrageScore >= 1.2 ? 20 : 0) + (paybackMonths <= 6 ? 20 : 10), 100);

  return {
    totalAcquisitionCost,
    buyerPremium: Math.round(investment * 0.16),
    taxes: Math.round((investment + investment * 0.16) * 0.21),
    transport: logisticsCost,
    refurbishment: 0,
    estimatedResaleValue: estimatedResale,
    grossProfit: Math.round(grossProfit),
    roi: Math.round(roi * 10) / 10,
    netProfitMargin: Math.round(netProfitMargin * 10) / 10,
    paybackMonths,
    tir: Math.round(tir * 10) / 10,
    arbitrageScore: Math.round(arbitrageScore * 100) / 100,
    isGanga: arbitrageScore >= 1.5,
    riskScore,
    riskLevel: riskScore >= 65 ? 'low' : riskScore >= 40 ? 'medium' : 'high'
  };
}

// Format currency
export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

// Format percentage
export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

// Format percentage (absolute, no sign)
export function formatPercentAbs(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Time remaining formatter
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Cerrada';
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}