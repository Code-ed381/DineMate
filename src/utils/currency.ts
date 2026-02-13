import { useSettingsStore } from "../lib/settingsStore";

/**
 * Formats a number as a currency string based on the restaurant's settings.
 * If settings are not loaded, it defaults to GHS (₵).
 */
export const formatCurrency = (amount: number | string | undefined | null) => {
  const numericAmount = parseFloat(String(amount || 0));
  const settings = useSettingsStore.getState().settings;
  const currencyCode = settings?.general?.currency_code || "GHS";
  const currencySymbol = settings?.general?.currency_symbol || "₵";

  try {
    return new Intl.NumberFormat('en-GH', { // Using GH locale for GHS support, but flexible
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch (e) {
    // Fallback if the currency code is invalid or locale fails
    return `${currencySymbol}${numericAmount.toFixed(2)}`;
  }
};

/**
 * React hook to get currency settings and formatting function.
 */
export const useCurrency = () => {
  const settings = useSettingsStore((state) => state.settings);
  const currencyCode = settings?.general?.currency_code || "GHS";
  const currencySymbol = settings?.general?.currency_symbol || "₵";

  const format = (amount: number | string | undefined | null) => {
    const numericAmount = parseFloat(String(amount || 0));
    try {
      return new Intl.NumberFormat('en-GH', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numericAmount);
    } catch (e) {
      return `${currencySymbol}${numericAmount.toFixed(2)}`;
    }
  };

  return { currencyCode, currencySymbol, format };
};

/**
 * Returns only the currency symbol from settings.
 * Note: This is non-reactive. Use useCurrency() hook in components.
 */
export const getCurrencySymbol = () => {
  const settings = useSettingsStore.getState().settings;
  return settings?.general?.currency_symbol || "₵";
};
