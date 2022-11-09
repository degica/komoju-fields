import '../../types.d'
import text from './template.html'

export default function(root: ShadowRoot, paymentMethod: KomojuPaymentMethod) {
  root.innerHTML = text;
}

