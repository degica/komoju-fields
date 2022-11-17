interface KomojuKonbiniBrand {
  icon: string,
}

interface KomojuKonbiniPaymentMethod extends KomojuPaymentMethod {
  type: 'konbini',
  brands: { [index: string]: KomojuKonbiniBrand }
}

interface KomojuPaymentMethod {
  type: string,
  customer_fee?: number,
  amount?: number,
  currency?: string,
  exchange_rate?: number,
  offsite?: boolean,
  additional_fields?: [string]
}

interface KomojuSession {
  id: string,
  resource: 'session',
  mode: 'payment' | 'customer' | 'customer_payment',
  amount: number,
  currency: string,
  session_url: string,
  return_url: string,
  default_locale: string,
  payment_methods: [KomojuPaymentMethod],
  created_at: string,
  cancelled_at: string,
  completed_at: string,
  status: 'pending' | 'completed'  | 'cancelled',
}

interface KomojuPayResult {
  status: 'pending' | 'completed' | 'error',
  error?: string | { code: string, details: object, message: string, param: string | null },
  redirect_url?: string,
}

type KomojuRenderFunction = (root: ShadowRoot, paymentMethod: KomojuPaymentMethod) => void;
type KomojuPaymentDetailsFunction = (root: ShadowRoot, paymentMethod: KomojuPaymentMethod) => object;

// These i18n types will catch invalid keys and missing translations.
type I18n = { [index: string]: any };

// Extension of the global window object with komojuTranslations for use by <komoju-i18n> elements.
interface WindowWithKomojuGlobals extends Window {
  komojuFieldsDebug: boolean,
  komojuTranslations: I18n,
  komojuLanguage: string,
}

// Individual payment methods will access certain attributes of the main <komoju-fields> element.
// This interface defines those attributes.
interface KomojuFieldsConfig extends HTMLElement {
  komojuCdn: string,
  komojuApi: string,
}

interface KomojuI18nElement extends HTMLElement {
  key: string | null,
  render(): void,
}

declare module '*.html' {
  const value: string;
  export default value;
}
