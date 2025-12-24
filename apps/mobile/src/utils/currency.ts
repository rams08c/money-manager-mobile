/**
 * Currency formatting utilities
 * Centralized currency symbol mapping and formatting logic
 */

/**
 * Map of currency codes to their symbols
 */
const CURRENCY_SYMBOLS: Record<string, string> = {
    // Major currencies
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',

    // Indian subcontinent
    INR: '₹',
    PKR: '₨',
    BDT: '৳',
    LKR: 'Rs',
    NPR: 'Rs',

    // Asia Pacific
    AUD: 'A$',
    NZD: 'NZ$',
    HKD: 'HK$',
    SGD: 'S$',
    KRW: '₩',
    THB: '฿',
    MYR: 'RM',
    IDR: 'Rp',
    PHP: '₱',
    VND: '₫',

    // Americas
    CAD: 'C$',
    MXN: 'Mex$',
    BRL: 'R$',
    ARS: '$',
    CLP: '$',

    // Europe
    CHF: 'CHF',
    SEK: 'kr',
    NOK: 'kr',
    DKK: 'kr',
    PLN: 'zł',
    CZK: 'Kč',
    HUF: 'Ft',
    RUB: '₽',
    TRY: '₺',

    // Middle East & Africa
    AED: 'د.إ',
    SAR: '﷼',
    ZAR: 'R',
    EGP: 'E£',
    NGN: '₦',
    KES: 'KSh',
};

/**
 * Currencies that don't use decimal places
 */
const ZERO_DECIMAL_CURRENCIES = new Set(['JPY', 'KRW', 'VND', 'CLP', 'IDR']);

/**
 * Get currency symbol for a given currency code
 * @param currencyCode - ISO 4217 currency code (e.g., 'USD', 'EUR', 'INR')
 * @returns Currency symbol (e.g., '$', '€', '₹')
 */
export function getCurrencySymbol(currencyCode: string): string {
    const code = currencyCode?.toUpperCase() || 'USD';
    return CURRENCY_SYMBOLS[code] || code;
}

/**
 * Get decimal places for a currency
 * @param currencyCode - ISO 4217 currency code
 * @returns Number of decimal places (0 or 2)
 */
export function getDecimalPlaces(currencyCode: string): number {
    const code = currencyCode?.toUpperCase() || 'USD';
    return ZERO_DECIMAL_CURRENCIES.has(code) ? 0 : 2;
}

/**
 * Format a number with thousand separators and decimals
 * @param amount - Amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string (e.g., '1,234.56')
 */
export function formatAmount(amount: number | string, decimals: number = 2): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(num)) {
        return '0.00';
    }

    // Format with decimals
    const fixed = num.toFixed(decimals);

    // Add thousand separators
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return parts.join('.');
}

/**
 * Format currency with symbol and amount
 * @param amount - Amount to format
 * @param currencyCode - ISO 4217 currency code (e.g., 'USD', 'EUR', 'INR')
 * @returns Formatted currency string (e.g., '$1,234.56', '₹1,234.56', '€1,234.56')
 */
export function formatCurrency(amount: number | string, currencyCode: string = 'USD'): string {
    const symbol = getCurrencySymbol(currencyCode);
    const decimals = getDecimalPlaces(currencyCode);
    const formattedAmount = formatAmount(amount, decimals);

    return `${symbol}${formattedAmount}`;
}

/**
 * Format currency with sign prefix for income/expense
 * @param amount - Amount to format
 * @param currencyCode - ISO 4217 currency code
 * @param type - Transaction type ('INCOME', 'EXPENSE', 'TRANSFER')
 * @returns Formatted currency with sign (e.g., '+$100.00', '-$50.00', '$75.00')
 */
export function formatSignedCurrency(
    amount: number | string,
    currencyCode: string = 'USD',
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
): string {
    const formatted = formatCurrency(amount, currencyCode);

    if (type === 'INCOME') {
        return `+${formatted}`;
    } else if (type === 'EXPENSE') {
        return `-${formatted}`;
    } else {
        return formatted;
    }
}
