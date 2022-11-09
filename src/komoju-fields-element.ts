import './types.d'
import spinner from './spinner.html'

export default class KomojuFieldsElement extends HTMLElement {
  static get observedAttributes() {
    return [
      'session-id',
      'payment-type',
    ];
  }

  session: KomojuSession | null = null
  module: {
    render: KomojuRenderFunction,
    paymentDetails: KomojuPaymentDetailsFunction
  } | null = null

  formSubmitHandler?: {
    form: HTMLFormElement,
    handler: (event: Event) => void
  }

  get komojuApi() {
    const value = this.getAttribute('komoju-api');
    if (!value || value === '') return 'https://komoju.com';
    else return value;
  }
  set komojuApi(value) {
    this.setAttribute('komoju-api', value ?? '');
  }

  get komojuCdn() {
    const value = this.getAttribute('komoju-cdn');
    if (!value || value === '') return 'https://multipay.komoju.com';
    else return value;
  }
  set komojuCdn(value) {
    this.setAttribute('komoju-cdn', value ?? '');
  }

  get sessionId() {
    return this.getAttribute('session-id');
  }
  set sessionId(value) {
    this.setAttribute('session-id', value ?? '');
  }

  get publishableKey() {
    return this.getAttribute('publishable-key');
  }
  set publishableKey(value) {
    this.setAttribute('publishable-key', value ?? '');
  }

  get paymentType() {
    return this.getAttribute('payment-type');
  }
  set paymentType(value) {
    this.setAttribute('payment-type', value ?? '');
  }

  constructor() {
    super();
    const root = this.attachShadow({mode: 'open'});
    root.innerHTML = spinner;
  }

  attributeChangedCallback(name: string, _oldValue: any, newValue: any) {
    if (name === 'session-id' && typeof newValue === 'string' && newValue != '') {
      // Just in case publishable-key is set before session-id, we fetch the session on next tick.
      setTimeout(async () => {
        const response = await this.komojuFetch('GET', `/api/v1/sessions/${newValue}`);

        if (response.status === 404) {
          console.error('Invalid KOMOJU session', newValue);
          return;
        }

        if (response.status !== 200) {
          console.error('Failed to retrieve KOMOJU session', response);
          return;
        }

        this.session = await response.json();
        if (!this.session) throw new Error('KOMOJU returned a null session');
        if (!this.paymentType) this.paymentType = this.session.payment_methods[0].type;

        this.render();
      }, 0);
    }
    else if (name === 'payment-type') {
      if (this.shadowRoot) this.shadowRoot.innerHTML = spinner;
      this.render();
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
  // 2. An external payment provider URL (i.e. for payment apps)
  // 3. The session's return_url in the case where payment is completed instantly
  async submit() {
    if (!this.module || !this.shadowRoot || !this.session) {
      throw new Error('Attempted to submit before selecting KOMOJU Payment method');
    }
    const paymentMethod = this.session.payment_methods.find(method => method.type === this.paymentType);
    if (!paymentMethod) throw new Error(`KOMOJU Payment method not found: ${this.paymentType}`);

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
