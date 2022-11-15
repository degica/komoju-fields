import './types.d'
import spinner from './spinner.html'
import { runValidation } from './shared/validation'
import KomojuI18nElement from './shared/komoju-i18n-element';

// Language gets stored in here, mostly controlled by <komoju-fields>.
declare let window: WindowWithKomojuTranslations;

export default class KomojuFieldsElement extends HTMLElement implements KomojuFieldsConfig {
  static get observedAttributes() {
    return [
      'session',
      'session-id',
      'payment-type',
      'locale',
    ];
  }

  // 'session' is also an attribute. Set the 'session' attribute to a stringified JSON of
  // the entire KOMOJU sesion to skip having to fetch it from KOMOJU again.
  session: KomojuSession | null = null
  module: {
    render: KomojuRenderFunction,
    paymentDetails: KomojuPaymentDetailsFunction
  } | null = null

  // When a <komoju-fields> element appears inside of a <form> tag,
  // we attach a submit handler to it.
  // This keeps track of that handler and lets us remove it when disconnected.
  formSubmitHandler?: {
    form: HTMLFormElement,
    handler: (event: Event) => void
  }

  // Attribute: komoju-api
  // Usually this'll just be https://komoju.com, but sometimes we use other URLs.
  get komojuApi() {
    const value = this.getAttribute('komoju-api');
    if (!value || value === '') return 'https://komoju.com';
    else return value;
  }
  set komojuApi(value) {
    this.setAttribute('komoju-api', value ?? '');
  }

  // Attribute: komoju-cdn
  // Where to fetch payment method modules.
  get komojuCdn() {
    const value = this.getAttribute('komoju-cdn');
    if (!value || value === '') return 'https://multipay.komoju.com';
    else return value;
  }
  set komojuCdn(value) {
    this.setAttribute('komoju-cdn', value ?? '');
  }

  // Attribute: session-id
  // KOMOJU Session ID. Create your session on the server then pass it in here.
  get sessionId() {
    return this.getAttribute('session-id');
  }
  set sessionId(value) {
    this.setAttribute('session-id', value ?? '');
  }

  // Attribute: publishable-key
  // KOMOJU publishable key. Get this from your merchant dashboard.
  get publishableKey() {
    return this.getAttribute('publishable-key');
  }
  set publishableKey(value) {
    this.setAttribute('publishable-key', value ?? '');
  }

  // Attribute: payment-type
  // Which payment type to show. If your session only has 1 payment type, this is unnecessary.
  // Alternatively, if a <komoju-picker> element is present, this will be set automatically.
  get paymentType() {
    return this.getAttribute('payment-type');
  }
  set paymentType(value) {
    this.setAttribute('payment-type', value ?? '');
  }

  // Attribute: locale
  // Language of text to show. Defaults to the browser's language.
  get locale() {
    return this.getAttribute('locale');
  }
  set locale(value) {
    this.setAttribute('locale', value ?? '');
  }

  // We start by just showing a spinner.
  constructor() {
    super();
    const root = this.attachShadow({mode: 'open'});
    root.innerHTML = spinner;
  }

  // Reactive attribute handling. When session or payment type is changed, we want to re-render.
  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (name === 'session') {
      if (!newValue || newValue == '') return;

      this.session = JSON.parse(newValue);
      window.komojuLanguage = this.session!.default_locale.substring(0, 2);
      if (!this.paymentType) this.paymentType = this.session!.payment_methods[0].type;
      this.render();
    } else if (name === 'session-id') {
      if (!newValue || newValue == '') return;

      // Just in case publishable-key is set before session-id, we fetch the session on next tick.
      setTimeout(async () => {
        const response = await this.komojuFetch('GET', `/api/v1/sessions/${newValue}`);

        if (response.status === 404) {
          console.error('Invalid KOMOJU session ID', newValue);
          return;
        }

        if (response.status !== 200) {
          console.error('Failed to retrieve KOMOJU session', response);
          return;
        }

        this.session = await response.json();
        if (!this.session) throw new Error('KOMOJU returned a null session');
        if (!this.paymentType) this.paymentType = this.session.payment_methods[0].type;
        window.komojuLanguage = this.session.default_locale.substring(0, 2);

        this.render();
      }, 0);
    }
    else if (name === 'payment-type') {
      if (!newValue || newValue == '') return;

      if (this.shadowRoot) this.shadowRoot.innerHTML = spinner;
      this.render();
    }
    else if (name === 'locale') {
      if (!newValue || newValue == '') return;

      window.komojuLanguage = newValue.substring(0, 2);
      const renderI18n = (el: Element) => (el as KomojuI18nElement).render();

      document.querySelectorAll('komoju-i18n').forEach(renderI18n);
      if (!this.shadowRoot) return;
      this.shadowRoot.querySelectorAll('komoju-i18n').forEach(renderI18n);
    }
  }

  // When connected, we want to find the form that this element is in and attach a submit handler to it.
  connectedCallback() {
    // Crudely search for parent element until it is a form tag.
    let parent = this.parentElement;
    while (parent && parent.tagName !== 'FORM') {
      parent = parent.parentElement;
    }
    // This is optional - implementers may call submit() manually.
    if (!parent) return;

    // Call this.submit on form submit.
    const form = parent as HTMLFormElement;
    const handler = (event: Event) => {
      event.preventDefault();
      this.submit();
    };
    form.addEventListener('submit', handler);
    this.formSubmitHandler = { form, handler };
  }

  // When disconnected, we want to remove the submit handler from the form (if added).
  disconnectedCallback() {
    if (!this.formSubmitHandler) return;
    this.formSubmitHandler.form.removeEventListener('submit', this.formSubmitHandler.handler);
  }

  // Submits payment details securely to KOMOJU before redirecting.
  // The redirect target may be
  // 1. A URL for performing 3DS authentication
  // 2. An external payment provider URL (i.e. to log into a payment app or show a QR code)
  // 3. The session's return_url in the case where payment is completed instantly
  async submit() {
    // TODO: small detail, but I kind of want to fade out the whole element during submit to prevent
    // double submits. Once that is in, I think we are feature complete and can start writing tests
    // and adding more payment methods.

    if (!this.module || !this.shadowRoot || !this.session) {
      throw new Error('Attempted to submit before selecting KOMOJU Payment method');
    }
    const paymentMethod = this.session.payment_methods.find(method => method.type === this.paymentType);
    if (!paymentMethod) throw new Error(`KOMOJU Payment method not found: ${this.paymentType}`);

    // Check for invalid input
    this.shadowRoot.querySelectorAll('komoju-error').forEach(error => error.remove());
    const validatedFields = this.shadowRoot.querySelectorAll('.has-validation');
    const errors = Array.prototype.map.call(validatedFields, (field) =>
      field instanceof HTMLInputElement ? runValidation(field) : null
    );
    if (errors.some(error => error != null)) {
      // Emit an event so implementers can handle this.
      this.dispatchEvent(new CustomEvent('komoju-error', {
        detail: { errors }, bubbles: true, composed: true,
      }));
      return;
    }

    // Now we can pull the payment details hash from the payment method module
    // and send it to KOMOJU.
    const paymentDetails = this.module.paymentDetails(this.shadowRoot, paymentMethod);
    const payResponse = await this.komojuFetch('POST', `/api/v1/sessions/${this.session.id}/pay`, {
      // TODO: supply fraud_details too
      payment_details: paymentDetails
    });
    const payResult = await payResponse.json() as KomojuPayResult;

    if (payResult.error) {
      // TODO: handle this better
      console.error(payResult);
      return;
    }

    this.shadowRoot.innerHTML = spinner;
    window.location.href = payResult.redirect_url!;
  }

  // Renders fields for the selected payment method.
  // Usually implementers would not need to call this manually.
  async render() {
    if (!this.session) throw new Error('KOMOJU Session not loaded');

    const paymentMethod = this.session.payment_methods.find(method => method.type === this.paymentType);
    if (!paymentMethod) throw new Error(`KOMOJU Payment method not found: ${this.paymentType}`);

    this.module = await import(`${this.komojuCdn}/fields/${this.paymentType}/module.js`);
    if (!this.module) throw new Error(`KOMOJU Payment module not found: ${this.paymentType}`);

    if (!this.shadowRoot) throw new Error('KOMOJU Fields element has no shadow root (internal bug)');
    this.module.render(this.shadowRoot, paymentMethod);
  }

  // fetch wrapper with KOMOJU authentication already handled.
  private komojuFetch(method: 'GET' | 'POST', path: string, body?: object): Promise<Response> {
    return fetch(`${this.komojuApi}${path}`, {
      method,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Basic ${btoa(`${this.publishableKey}:`)}`,
      },
      body: body ? JSON.stringify(body) : undefined
    });
  }
}
