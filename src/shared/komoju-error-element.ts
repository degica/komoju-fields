// This is a <komoju-error> error tag we use internally for displaying validation errors.
// End users are not expected to use this.
export default class KomojuErrorElement extends HTMLElement {
  container: HTMLElement;

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });

    // This container will stretch and shrink as the error message appears and disappears.
    const container = document.createElement('div');
    this.container = container;
    container.style.height = '0';
    container.style.overflowY = 'hidden';
    container.style.transition = 'height 0.2s ease-in-out';

    // This element's contents appears inside of the container.
    const slot = document.createElement('slot');
    container.append(slot);

    root.append(container);
  }

  // Animate the height of the error message when it appears on the page.
  connectedCallback() {
    this.container.style.height = this.container.scrollHeight + 'px';
    // TODO: we can use a resize ovserver to make sure this height adjusts if the
    // parent element's width changes.
  }

  // Animates the height of the error message when it is removed from the page.
  override remove() {
    this.classList.add('removing');
    this.container.style.height = '0';
    this.container.addEventListener('transitionend', () => {
      super.remove();
    });
  }
}
