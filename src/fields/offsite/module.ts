import '../../types.d';
// @ts-ignore
import html from './template.html';
import { addValidation } from '../../shared/validation';

import { registerMessages } from '../../shared/translations';
import * as i18n from './i18n';
registerMessages(i18n);

export const render: KomojuRenderFunction = (root, paymentMethod) => {
  const config = root.host as KomojuFieldsConfig;
  root.innerHTML = html;

  root.querySelectorAll('.fields').forEach((element) => {
    element.classList.add(paymentMethod.type);
  });

  // Render QR code.
  const qrImg = root.querySelector('.offsite-qr-code') as HTMLImageElement;
  if (!config.session) {
    throw new Error('KOMOJU Fields bug: offsite rendered without session?');
  }
  qrImg.src = `${config.session.session_url}/qr.svg`;

  // Listen for external session completion.
  const storage = root.querySelector('.offsite') as HTMLElement;
  storage.dataset.interval = setInterval(async () => {
    if (!config.session) return;
    const response = await config.komojuFetch('GET', `/api/v1/sessions/${config.session.id}`);
    const session = await response.json() as KomojuSession;

    // Redirect right away if the session is complete.
    if (session.status === 'completed') {
      cleanup(root, paymentMethod);
      const url = new URL(session.return_url);
      url.searchParams.append('session_id', session.id);
      window.location.href = url.toString();
    }
  }, 3000).toString();

  // Render optional additional fields.
  // The payment_method object tells us which fields are needed.
  const fieldTemplate = root.getElementById('additional-field')! as HTMLTemplateElement;
  for (const field of paymentMethod.additional_fields ?? []) {
    const element = fieldTemplate.content.cloneNode(true) as HTMLElement;
    const input = element.querySelector('input') as HTMLInputElement;
    const text = element.querySelector('komoju-i18n') as KomojuI18nElement;

    if (field === 'email') input.type = 'email';
    else if (field === 'phone') input.type = 'tel';
    input.id = `offsite-${field}`;

    text.key = `os.label.${field}`;

    fieldTemplate.parentElement!.appendChild(element);

    addValidation(i18n, input, (input) => {
      if (input.value === '') return 'os.error.required';
      return null;
    });
  }
}

export const cleanup: KomojuRenderFunction = (root, _paymentMethod) => {
  // Remove occasional poll
  const storage = root.querySelector('.offsite') as HTMLElement;
  const interval = storage.dataset.interval;
  if (typeof interval === 'string' && interval !== '') {
    window.clearInterval(parseInt(interval));
    storage.dataset.interval = '';
  }
}

export const paymentDetails: KomojuPaymentDetailsFunction = (root, paymentMethod) => {
  const result: any = {
    type: paymentMethod.type,
  };

  for (const field of paymentMethod.additional_fields ?? []) {
    const input = root.getElementById(`offsite-${field}`)! as HTMLInputElement;
    result[field] = input.value;
  }

  return result;
}
