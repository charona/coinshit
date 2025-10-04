export interface Entry {
  id: string;
  userName: string;
  productName: string;
  imageUrl: string;
  purchaseDate: Date;
  fiatAmount: number;
  currency: Currency;
  createdAt: Date;
}

export interface BitcoinPriceData {
  date: string;
  price: number;
}

export interface CalculatedEntry extends Entry {
  btcAmount: number;
  currentValue: number;
  difference: number;
  percentageDiff: number;
  saved: boolean;
}

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CHF' | 'JPY' | 'CAD' | 'AUD';

export const CURRENCIES: Currency[] = ['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD'];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CHF: 'CHF',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$'
};
