import './html.d'
import text from './fields/credit_card/template.html'

console.log(text);

export default class KomojuFieldsElement extends HTMLElement {
  static get observedAttributes() {
    return [
      'session-id',
      'publishable-key',
    ];
  }
}
