import './types.d'

export default class KomojuFieldsElement extends HTMLElement {
  static get observedAttributes() {
    return [
      'session-id',
      'publishable-key',
    ];
  }

  /*
    TODO:
    1. get session from ID
    2. based on payment types, dynamic-import the appropriate fields
    3. render the fields

    Also we need to figure out how to configure both komoju.com and multipay.komoju.com endpoints.
  */
}
