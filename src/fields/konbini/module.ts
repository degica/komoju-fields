import '../../types.d';
// @ts-ignore
import html from './template.html'
import { addValidation } from '../../shared/validation';
import { setupRadioParentCheckedClass } from '../../shared/radio-helpers';

import { registerMessages } from '../../shared/translations';
import * as i18n from './i18n';
registerMessages(i18n);

export const render: KomojuRenderFunction = (root, paymentMethod) => {
  root.innerHTML = html;
  initializeInputs(root, root.host as KomojuFieldsConfig, paymentMethod as KomojuKonbiniPaymentMethod);
}

export const paymentDetails: KomojuPaymentDetailsFunction = (root, _paymentMethod) => {
  const name = root.getElementById('kb-name')! as HTMLInputElement;
  const email = root.getElementById('kb-email')! as HTMLInputElement;
  const store = root.querySelector('input[name="kb-store"]:checked')! as HTMLInputElement;

  return {
    type: 'konbini',
    store: store.value,
    email: email.value,
    name: name.value,
  }
}

function initializeInputs(
  document: DocumentFragment,
  config: KomojuFieldsConfig,
  paymentMethod: KomojuKonbiniPaymentMethod
) {
  const radioTemplate = document.getElementById('konbini-radio')! as HTMLTemplateElement;
  const email = document.getElementById('kb-email')! as HTMLInputElement;
  
  let checked = false;
  for (const brand in paymentMethod.brands) {
    const element = radioTemplate.content.cloneNode(true) as HTMLElement;
    const input = element.querySelector('input') as HTMLInputElement;
    const image = element.querySelector('img') as HTMLImageElement;
    const label = element.querySelector('komoju-i18n') as KomojuI18nElement;

    input.value = brand;
    if (!checked) {
      input.checked = true;
      checked = true;
    }
    setupRadioParentCheckedClass(input, document);

    image.src = `${config.komojuApi}${paymentMethod.brands[brand].icon}`;
    label.key = `kb.store.${brand}`;

    radioTemplate.parentElement!.appendChild(element);
  }

  addValidation(i18n, email, (input) => {
    if (input.value === '') return 'kb.error.required';
    return null;
  });
}
