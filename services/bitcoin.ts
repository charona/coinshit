import axios from 'axios';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Currency } from '../utils/types';

const BINANCE_API = 'https://api.binance.com/api/v3';
const COINAPI_URL = 'https://api-historical.exrates.coinapi.io/v1';
const COINAPI_KEY = 'bb331bd5-9b5b-49af-92f3-ad8ee4820f58';
const FRANKFURTER_API = 'https://api.frankfurter.dev/v1';

// In-memory cache for current session
const memoryCache = new Map<string, { price: number; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get current Bitcoin price in USD from Binance
 */
async function getCurrentBTCUSD(): Promise<number> {
  const cacheKey = 'current-btcusd';
  const cached = memoryCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price;
  }

  try {
    const response = await axios.get(`${BINANCE_API}/ticker/price`, {
      params: { symbol: 'BTCUSDT' }
    });

    const price = parseFloat(response.data.price);
    memoryCache.set(cacheKey, { price, timestamp: Date.now() });
    return price;
  } catch (error) {
    console.error('Error fetching current BTC price from Binance:', error);
    throw new Error('Failed to fetch current Bitcoin price');
  }
}

/**
 * Get current Bitcoin price in specified currency
 */
export async function getCurrentBitcoinPrice(currency: Currency = 'USD'): Promise<number> {
  const btcUsd = await getCurrentBTCUSD();

  if (currency === 'USD') {
    return btcUsd;
  }

  // Get current exchange rate (use yesterday's rates as they're the latest available)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const exchangeRate = await getExchangeRate('USD', currency, yesterday);

  return btcUsd * exchangeRate;
}

/**
 * Get historical BTC/USD price from CoinAPI with Firestore caching
 */
async function getHistoricalBTCUSD(date: Date): Promise<number> {
  const dateString = formatDateISO(date);
  const cacheKey = `btc-usd-${dateString}`;

  // Check Firestore cache first
  try {
    const docRef = doc(db, 'btc_prices', cacheKey);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().price;
    }
  } catch (error) {
    console.error('Error reading from Firestore cache:', error);
  }

  // Fetch from CoinAPI
  try {
    const time = `${dateString}T12:00:00.0000000Z`;
    const response = await axios.get(`${COINAPI_URL}/exchangerate/BTC/USD`, {
      params: { time },
      headers: {
        'Accept': 'text/plain',
        'X-CoinAPI-Key': COINAPI_KEY
      }
    });

    const price = response.data.rate;

    // Cache in Firestore
    try {
      await setDoc(doc(db, 'btc_prices', cacheKey), {
        price,
        date: dateString,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error caching to Firestore:', error);
    }

    return price;
  } catch (error) {
    console.error('Error fetching historical BTC price from CoinAPI:', error);
    throw new Error('Failed to fetch historical Bitcoin price');
  }
}

/**
 * Get exchange rate from Frankfurter API with Firestore caching
 */
async function getExchangeRate(from: string, to: Currency, date: Date): Promise<number> {
  const dateString = formatDateISO(date);
  const cacheKey = `fx-${from}-${to}-${dateString}`;

  // Check Firestore cache first
  try {
    const docRef = doc(db, 'exchange_rates', cacheKey);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().rate;
    }
  } catch (error) {
    console.error('Error reading exchange rate from Firestore cache:', error);
  }

  // Fetch from Frankfurter API
  try {
    const response = await axios.get(`${FRANKFURTER_API}/${dateString}`, {
      params: { base: from }
    });

    const rate = response.data.rates[to];

    if (!rate) {
      throw new Error(`Exchange rate for ${to} not found`);
    }

    // Cache in Firestore
    try {
      await setDoc(doc(db, 'exchange_rates', cacheKey), {
        rate,
        from,
        to,
        date: dateString,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error caching exchange rate to Firestore:', error);
    }

    return rate;
  } catch (error) {
    console.error('Error fetching exchange rate from Frankfurter:', error);
    throw new Error('Failed to fetch exchange rate');
  }
}

/**
 * Get historical Bitcoin price for a specific date
 */
export async function getHistoricalBitcoinPrice(
  date: Date,
  currency: Currency = 'USD'
): Promise<number> {
  const btcUsd = await getHistoricalBTCUSD(date);

  if (currency === 'USD') {
    return btcUsd;
  }

  // Get exchange rate for the specific date
  const exchangeRate = await getExchangeRate('USD', currency, date);
  return btcUsd * exchangeRate;
}

/**
 * Format date as YYYY-MM-DD for APIs
 */
function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
