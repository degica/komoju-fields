import '../../types.d';
// @ts-ignore
import html from './template.html';
import { addValidation } from '../../shared/validation';

import { registerMessages } from '../../shared/translations';
import * as i18n from './i18n';
registerMessages(i18n);

export const render: KomojuRenderFunction = (root, paymentMethod) => {
  root.innerHTML = html;

  root.querySelectorAll('.fields').forEach((element) => {
    element.classList.add(paymentMethod.type);
  });

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
