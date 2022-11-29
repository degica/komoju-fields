interface KomojuCreditCardPaymentMethod extends KomojuPaymentMethod {
  type: 'konbini',
  brands: string[],
}

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
  additional_fields?: Array<string>
}

// This is the response to /api/v1/sessions
interface KomojuSession {
  id: string,
  resource: 'session',
  mode: 'payment' | 'customer' | 'customer_payment',
  amount: number,
  currency: string,
  session_url: string,
  return_url: string,
  default_locale: string,
  payment_methods: Array<KomojuPaymentMethod>,
  created_at: string,
  cancelled_at: string,
  completed_at: string,
  status: 'pending' | 'completed'  | 'cancelled',
}

// This is the response to /api/v1/payment_methods
interface KomojuPaymentMethodMeta {
  name_en: string,
  name_ja: string,
  name_ko: string,
  type_slug: string,
  currency: string,
  subtypes?: Array<string>,
}

// This is the response to /api/v1/sessions/:id/pay
interface KomojuPayResult {
  status: 'pending' | 'completed' | 'error',
  error?: string | { code: string, details: object, message: string, param: string | null },
  redirect_url?: string,
}

// Every individual payment method module has this "render function" and "payment_details function".
type KomojuRenderFunction = (root: ShadowRoot, paymentMethod: KomojuPaymentMethod) => void;
// The payment_details function is used for submitting payment to KOMOJU. It's the same format as
// /api/v1/payments payment_details.
type KomojuPaymentDetailsFunction = (root: ShadowRoot, paymentMethod: KomojuPaymentMethod) => object;

// Translated messages are just a map of message keys to translated strings.
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
  theme: string | null,
  komojuCdn: string,
  komojuApi: string,
  paymentType: string | null,
  session: KomojuSession | null,
  komojuFetch(method: 'GET' | 'POST', path: string, body?: object): Promise<Response>,
}

interface KomojuI18nElement extends HTMLElement {
  key: string | null,
  render(): void,
}

interface KomojuSessionChangeEvent extends CustomEvent {
  detail: {
    session: KomojuSession
  }
}

declare module '*.html' {
  const value: string;
  export default value;
}
