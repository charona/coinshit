import { Entry, CalculatedEntry, Currency } from './types';
import { getCurrentBitcoinPrice, getHistoricalBitcoinPrice } from '../services/bitcoin';

/**
 * Calculate Bitcoin savings/loss for an entry
 */
export async function calculateEntryValue(entry: Entry): Promise<CalculatedEntry> {
  try {
    // Get historical price when purchase was made
    const historicalPrice = await getHistoricalBitcoinPrice(
      entry.purchaseDate,
      entry.currency
    );

    // Calculate how much BTC could have been bought
    const btcAmount = entry.fiatAmount / historicalPrice;

    // Get current BTC price
    const currentPrice = await getCurrentBitcoinPrice(entry.currency);

    // Calculate current value
    const currentValue = btcAmount * currentPrice;

    // Calculate difference (how much you LOST by not buying BTC)
    const difference = currentValue - entry.fiatAmount;
    const percentageDiff = (difference / entry.fiatAmount) * 100;
    // If difference > 0, you LOST money (BTC would be worth more)
    // If difference < 0, you SAVED money (BTC would be worth less)
    const saved = difference < 0;

    return {
      ...entry,
      btcAmount,
      currentValue,
      difference: Math.abs(difference),
      percentageDiff: Math.abs(percentageDiff),
      saved
    };
  } catch (error) {
    console.error('Error calculating entry value:', error);
    throw error;
  }
}

/**
 * Format currency value with symbol
 */
export function formatCurrency(amount: number, currency: Currency | string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CHF: 'CHF ',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$'
  };

  const symbol = symbols[currency] || currency;
  // Round to nearest integer and add thousand separators
  const formatted = Math.round(amount).toLocaleString('en-US');

  if (currency === 'CHF') {
    return `${symbol}${formatted}`;
  }

  return `${symbol}${formatted}`;
}

/**
 * Format percentage with conditional decimals
 */
export function formatPercentage(percentage: number): string {
  const absPercentage = Math.abs(percentage);

  // Show 1 decimal if between -10 and +10
  if (absPercentage < 10) {
    return percentage.toFixed(1);
  }

  // Otherwise show no decimals with thousand separators
  return Math.round(percentage).toLocaleString('en-US');
}
