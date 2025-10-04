import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { Currency } from './types';

/**
 * Detect user's currency based on their location
 */
export async function detectUserCurrency(): Promise<Currency> {
  // Use browser locale/IP detection on web
  if (Platform.OS === 'web') {
    return detectCurrencyFromBrowser();
  }

  try {
    // Request location permission
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      return 'USD'; // Default to USD if permission denied
    }

    // Get user's location with timeout
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Low,
      timeInterval: 5000,
      distanceInterval: 1000
    });
    const { latitude, longitude } = location.coords;

    // Reverse geocode to get country
    const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });

    if (geocode.length > 0) {
      const country = geocode[0].isoCountryCode;
      return getCurrencyByCountry(country || 'US');
    }

    return 'USD';
  } catch (error) {
    // Silently default to USD on error (location not available)
    return 'USD';
  }
}

/**
 * Detect currency from browser locale and timezone
 */
function detectCurrencyFromBrowser(): Currency {
  if (typeof window === 'undefined') {
    return 'USD';
  }

  // Try to detect from browser locale
  const locale = navigator.language || navigator.languages?.[0] || 'en-US';

  // Map common locales to currencies
  if (locale.includes('GB') || locale.includes('en-GB')) return 'GBP';
  if (locale.includes('CH') || locale.includes('de-CH') || locale.includes('fr-CH')) return 'CHF';
  if (locale.includes('JP') || locale.includes('ja')) return 'JPY';
  if (locale.includes('CA') || locale.includes('en-CA') || locale.includes('fr-CA')) return 'CAD';
  if (locale.includes('AU') || locale.includes('en-AU')) return 'AUD';
  if (locale.includes('de') || locale.includes('fr') || locale.includes('it') ||
      locale.includes('es') || locale.includes('nl') || locale.includes('pt') ||
      locale.includes('fi') || locale.includes('at') || locale.includes('be') ||
      locale.includes('ie') || locale.includes('gr')) return 'EUR';

  // Try timezone as backup
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (timezone.includes('Europe')) {
    if (timezone.includes('London')) return 'GBP';
    if (timezone.includes('Zurich')) return 'CHF';
    return 'EUR';
  }
  if (timezone.includes('Tokyo')) return 'JPY';
  if (timezone.includes('Sydney') || timezone.includes('Melbourne')) return 'AUD';
  if (timezone.includes('Toronto') || timezone.includes('Vancouver')) return 'CAD';

  return 'USD';
}

/**
 * Map country code to currency
 */
function getCurrencyByCountry(countryCode: string): Currency {
  const currencyMap: Record<string, Currency> = {
    US: 'USD',
    GB: 'GBP',
    EU: 'EUR',
    DE: 'EUR',
    FR: 'EUR',
    IT: 'EUR',
    ES: 'EUR',
    NL: 'EUR',
    BE: 'EUR',
    AT: 'EUR',
    PT: 'EUR',
    IE: 'EUR',
    FI: 'EUR',
    GR: 'EUR',
    CH: 'CHF',
    JP: 'JPY',
    CA: 'CAD',
    AU: 'AUD'
  };

  return currencyMap[countryCode] || 'USD';
}
