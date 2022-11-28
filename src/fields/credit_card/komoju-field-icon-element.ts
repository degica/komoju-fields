import html from './komoju-field-icon.html'

// This <komoju-field-icon> element is only used for credit card.
//
// It lets us show the brand icons on the right side of an input element
// without requiring sensitive DOM structure and CSS.
//
// Not having to worry about the DOM structure and CSS makes it easier to
// allow custom CSS to be applied to the input elements.
export default class KomojuFieldIconElement extends HTMLElement {
  static get observedAttributes() {
    return ['icon', 'for'];
  }

  // The element that this icon is for. Probably always an <input> element.
  get target() {
    const targetId = this.getAttribute('for');
    const root = this.getRootNode() as HTMLElement;
    if (!targetId || !root || !root['querySelector']) return undefined;
    else return root.querySelector(`#${targetId}`) as HTMLElement;
  }
  set target(target: HTMLElement | undefined) {
    if (target) this.setAttribute('for', target.id);
    else this.setAttribute('for', '');
  }

  get icon() {
    return this.getAttribute('icon') || '';
  }
  set icon(value: string) {
    this.setAttribute('icon', value);
  }

  resizeObserver?: ResizeObserver;

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = html;
  }

  connectedCallback() {
    this.style.width = '0';
    this.style.height = '0';

    const parent = this.parentElement;
    if (!parent) return;

    this.resizeObserver = new ResizeObserver(() => {
      this.reposition();
    });
    this.resizeObserver!.observe(parent);
    this.reposition();
  }

  disconnectedCallback() {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }
 
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string) {
    if (name === 'icon') {
      const container = this.shadowRoot?.getElementById('komoju-field-icon');
      if (!container) return;
      if (oldValue === newValue) return;

      const iconWidth = 42;
      const iconGap = 4;

      const icons = newValue.split(/\s+/);
      const oldIcons = oldValue ? oldValue.split(/\s+/) : [];
      const newIcons = icons.filter((icon) => !oldIcons.includes(icon));
      const removedIcons = oldIcons.filter((icon) => !icons.includes(icon));

      // First, add elements for new icons we've never seen before
      for (const icon of newIcons) {
        const existing = container.querySelector(`img[src="${icon}"]`) as HTMLImageElement;
        if (existing) {
          existing.style.opacity = '1';
          continue;
        }

        const img = document.createElement('img');
        img.src = icon;
        img.width = iconWidth;
        container.append(img);
        img.style.opacity = '1';
      }

      // Then, remove elements for icons that are no longer present
      for (const icon of removedIcons) {
        const img = container.querySelector(`img[src="${icon}"]`) as HTMLImageElement;
        img.style.opacity = '0';
        img.style.marginRight = '0';
      }

      // Finally, reposition the icons
      let i = 0;
      for (const icon of icons.reverse()) {
        const img = container.querySelector(`img[src="${icon}"]`) as HTMLImageElement;
        img.style.marginRight = `${i * (iconWidth + iconGap)}px`;
        i += 1;
      }
    }
    else if (name === 'for') {
      this.reposition();
    }
  }

  // This is for positioning the container element relative to the target input.
  // With this, we can show the icons on the right side of the input without
  // requiring the input to have a specific DOM structure or CSS.
  reposition() {
    const parent = this.parentElement;
    const target = this.target;
    const container = this.shadowRoot?.getElementById('komoju-field-icon');
    if (!target || !parent || !container) return;

    container.style.top = `${target.offsetTop}px`;
    container.style.right = `${parent.offsetWidth - target.offsetWidth - target.offsetLeft}px`;
    container.style.height = `${target.offsetHeight}px`;

    const targetStyle = window.getComputedStyle(target);

    container.style.paddingRight = targetStyle.paddingRight;
    container.style.paddingTop = targetStyle.paddingTop;
    container.style.paddingBottom = targetStyle.paddingBottom;
  }
}
