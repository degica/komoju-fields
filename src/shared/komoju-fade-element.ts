import '../types.d'

// This is <komoju-fade>. It's used internally to fade out the fields temporarily during submit.
// This prevents double submits and also signals to the user that something is happening.
//
// <komoju-fade> must be placed at the top of the .fields element, otherwise sizing and placement
// won't work well.
export default class KomojuFadeElement extends HTMLElement {
  resizeObserver?: ResizeObserver;

  connectedCallback() {
    const fields = this.parentElement;
    if (!fields) return;

    this.resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      this.style.width = `${width}px`;
      this.style.height = `${height}px`;
    });
    this.resizeObserver?.observe(fields);
  }

  disconnectedCallback() {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }
}
