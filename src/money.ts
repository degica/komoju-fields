export const noDecimalCurrencies = [
  'BIF', // Burundian Franc
  'CLP', // Chilean Peso
  'DJF', // Djiboutian Franc
  'GNF', // Guinean Franc
  'JPY', // Japanese Yen
  'KMF', // Comorian Franc
  'KRW', // South Korean Won
  'MGA', // Malagasy Ariary
  'PYG', // Paraguayan Guaraní
  'RWF', // Rwandan Franc
  'UGX', // Ugandan Shilling
  'VND', // Vietnamese Đồng
  'VUV', // Vanuatu Vatu
  'XAF', // Central African Cfa Franc
  'XOF', // West African Cfa Franc
  'XPF', // Cfp Franc
];

// Currently modern browsers depend on ISO 4217
//
// We do support non-fiat currencies which are not part of the
// ISO standard and require us to build formatters for
const nonISOCurrencies = [
  'USDC'
]

const displayCurrencyCodeInsteadOfSymbol = [
  'CNY',
];

export function formatMoney(amountCents: number, currency: string, locale: string = 'en') {
  function nonISOFormat(currency: string, amountCents: number) {
    if (!amountCents) {
      return '';
    } else if (nonISOCurrencies.includes(currency) || !currency) {
      return `${amountCents.toLocaleString()} ${currency}`;
    } else {
      throw 'invalid currency format';
    }
  }

  const amountDecimal = decentify(amountCents, currency);

  if (nonISOCurrencies.includes(currency) || !currency) {
    return nonISOFormat(currency, amountDecimal)
  } else {
    const numberFormat = new Intl.NumberFormat(`${locale}-JP`, {
      style: 'currency',
      currency: currency,
      currencyDisplay: displayCurrencyCodeInsteadOfSymbol.includes(currency) ? "code" : "symbol"
    });

    return numberFormat.format(amountDecimal);
  }
};

export function decentify(amountCents: number, currency: string) {
  return noDecimalCurrencies.includes(currency) ? amountCents : amountCents / 100.0;
}
