import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('proto-settings')
export class ProtoSettings extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .container {
      padding: var(--jh-dimension-600, 3rem);
    }

    h1 {
      font-size: var(--jh-font-size-500, 1.5rem);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled);
      margin: 0;
    }
  `

  render() {
    return html`
      <div class="container">
        <h1>Settings</h1>
      </div>
    `
  }
}
