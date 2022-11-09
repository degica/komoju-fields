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
  error?: string | object,
  redirect_url?: string,
}

type KomojuRenderFunction = (root: ShadowRoot, paymentMethod: KomojuPaymentMethod) => void;
type KomojuPaymentDetailsFunction = (root: ShadowRoot, paymentMethod: KomojuPaymentMethod) => object;

declare module '*.html' {
  const value: string;
  export default value;
}
