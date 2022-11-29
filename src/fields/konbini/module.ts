import '../../types.d'
import html from './template.html'
import { addValidation } from '../../shared/validation';

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
      input.parentElement!.classList.add('checked');
      checked = true;
    }

    image.src = `${config.komojuApi}${paymentMethod.brands[brand].icon}`;
    label.key = `kb.store.${brand}`;

    // Add .checked to the parent .radio element when the input is checked.
    // This is just to make the CSS a little easier, since we're putting the
    // input inside of the label.
    input.addEventListener('change', () => {
      document.querySelectorAll('.radio.checked').forEach((el) => el.classList.remove('checked'));
      input.parentElement!.classList.add('checked');
    });

    radioTemplate.parentElement!.appendChild(element);
  }

  addValidation(i18n, email, (input) => {
    if (input.value === '') return 'kb.error.required';
    return null;
  });
}
