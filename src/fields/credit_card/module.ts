import '../../types.d'
import text from './template.html'

export const render: KomojuRenderFunction = (root, paymentMethod) => {
  root.innerHTML = text;
}

export const paymentDetails: KomojuPaymentDetailsFunction = (root, _paymentMethod) => {
  const name = root.getElementById('cc-name') as HTMLInputElement;
  const number = root.getElementById('cc-number') as HTMLInputElement;
  const month = root.getElementById('cc-month') as HTMLInputElement;
  const year = root.getElementById('cc-year') as HTMLInputElement;
  const cvc = root.getElementById('cc-cvc') as HTMLInputElement;

  return {
    type: 'credit_card',
    name: name.value,
    number: number.value,
    month: month.value,
    year: year.value,
    verification_value: cvc.value,
  }
}
