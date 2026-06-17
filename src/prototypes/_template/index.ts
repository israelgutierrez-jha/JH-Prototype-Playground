import { LitElement, html, css } from 'lit'
import '@jack-henry/jh-elements/components/button/button.js'
import '@jack-henry/jh-elements/components/card/card.js'

// ── My Prototype ──────────────────────────────────────────────────────────────
// Describe what this prototype is demonstrating in a comment here.
//
// Pattern: export default class extending LitElement.
// The playground shell registers and mounts this element automatically.
// Import JH components at the top, then compose them in render().
// ─────────────────────────────────────────────────────────────────────────────

export default class MyPrototype extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--jh-dimension-400, 2rem);
      padding: var(--jh-dimension-600, 3rem);
    }

    h1 {
      font-size: var(--jh-font-size-500, 1.5rem);
      font-weight: var(--jh-font-weight-bold, 700);
      color: var(--jh-color-content-primary-enabled, #1a1a1a);
      margin: 0;
    }

    jh-card {
      width: 100%;
      max-width: 480px;
    }

    .card-content {
      padding: var(--jh-dimension-400, 2rem);
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-300, 1.5rem);
    }
  `

  render() {
    return html`
      <div class="container">
        <h1>My Prototype</h1>
        <jh-card>
          <div class="card-content">
            <p>Replace this with your prototype content.</p>
            <jh-button
              label="Action"
              appearance="primary"
              @click=${() => alert('Button clicked!')}
            ></jh-button>
          </div>
        </jh-card>
      </div>
    `
  }
}
