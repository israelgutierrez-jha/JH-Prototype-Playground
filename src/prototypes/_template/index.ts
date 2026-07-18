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
      /* --jh-* tokens are always defined; the second arg is a fallback that
         should match the token's real PIXEL value (see CLAUDE.md token table),
         never a rem guess — a wrong fallback silently misleads. */
      gap: var(--jh-dimension-400, 16px);
      padding: var(--jh-dimension-600, 24px);
    }

    h1 {
      font-size: var(--jh-font-size-600, 24px);
      font-weight: var(--jh-font-weight-700, 700);
      color: var(--jh-color-content-primary-enabled, #1a1a1a);
      margin: 0;
    }

    jh-card {
      width: 100%;
      max-width: 480px;
    }

    .card-content {
      padding: var(--jh-dimension-400, 16px);
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-300, 12px);
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
