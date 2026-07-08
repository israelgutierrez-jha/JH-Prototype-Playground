import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import '@jack-henry/jh-elements/components/card/card.js'
import '@jack-henry/jh-elements/components/button/button.js'
import { pageHeaderStyles } from '../styles/page-header.js'

@customElement('proto-features-vision')
export class ProtoFeaturesVision extends LitElement {
  static styles = [
    pageHeaderStyles,
    css`
    :host {
      display: block;
    }

    .page-body {
      padding: var(--jh-dimension-500, 2.5rem) var(--jh-dimension-600, 3rem) var(--jh-dimension-600, 3rem);
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-500, 2.5rem);
      max-width: 760px;
    }

    jh-card {
      display: block;
    }

    .card-body {
      padding: var(--jh-dimension-500, 2.5rem);
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-300, 1.5rem);
    }

    .card-title {
      margin: 0;
      font-size: var(--jh-font-size-500, 1.5rem);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled);
    }

    .lede {
      margin: 0;
      font-size: var(--jh-font-size-400, 1.25rem);
      line-height: 1.5;
      color: var(--jh-color-content-primary-enabled);
    }

    p {
      margin: 0;
      font-size: var(--jh-font-size-350, 0.875rem);
      line-height: 1.6;
      color: var(--jh-color-content-secondary-enabled);
    }

    ul {
      margin: 0;
      padding-left: var(--jh-dimension-400, 1.25rem);
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-200, 0.75rem);
    }

    li {
      font-size: var(--jh-font-size-350, 0.875rem);
      line-height: 1.6;
      color: var(--jh-color-content-secondary-enabled);
    }

    li strong {
      color: var(--jh-color-content-primary-enabled);
      font-weight: var(--jh-font-weight-semibold, 600);
    }

    .stats {
      display: flex;
      flex-wrap: wrap;
      gap: var(--jh-dimension-600, 2rem);
    }

    .stat-value {
      display: block;
      font-size: var(--jh-font-size-600, 1.75rem);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-brand-enabled);
    }

    .stat-label {
      display: block;
      font-size: var(--jh-font-size-300, 0.75rem);
      color: var(--jh-color-content-secondary-enabled);
      margin-top: var(--jh-dimension-50, 0.25rem);
    }

    .stats-note {
      font-size: var(--jh-font-size-300, 0.75rem);
      color: var(--jh-color-content-secondary-enabled);
      font-style: italic;
    }

    .closing {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--jh-dimension-300, 1.5rem);
    }

    .closing p {
      max-width: 480px;
    }
  `,
  ]

  private _goToBoard() {
    window.location.hash = '#/features'
  }

  render() {
    return html`
      <div class="page-header">
        <div class="page-header-text">
          <h1 class="page-title">Why this exists</h1>
          <p class="page-subtitle">
            The philosophy behind the JH Prototype Playground, and what it's already proven.
          </p>
        </div>
      </div>

      <div class="page-body">
        <jh-card>
          <div class="card-body">
            <p class="lede">
              Prototypes should encounter reality as early as possible.
            </p>
            <p>
              Every prototype here is built with the exact same JH components that ship to
              production — not idealized comps that might not survive contact with a real
              component's constraints. If it works here, it isn't a surprise later.
            </p>
          </div>
        </jh-card>

        <jh-card>
          <div class="card-body">
            <h2 class="card-title">Built for designers, not just developers</h2>
            <ul>
              <li><strong>No coding background required.</strong> Describe what you want, and the AI scaffolds a working, on-brand prototype — real loading states, multi-step flows, and error states, not a static click-through.</li>
              <li><strong>Bring your own AI.</strong> Works with Claude Code or Cursor, whichever you already use — nothing new to license or learn.</li>
              <li><strong>The guardrails are automatic.</strong> The AI is instructed to only use JH components and tokens, and stops to ask before it would ever go off-brand. Consistency isn't a review checkpoint here — it's structural.</li>
<li><strong>Zero setup friction, and it stays current on its own.</strong> Clone it, run it, and it keeps itself up to date without you needing to know git or npm.</li>              <li><strong>One shared gallery, not scattered links.</strong> Every prototype lives in one versioned place instead of dying in a Slack thread.</li>
            </ul>
          </div>
        </jh-card>

        <jh-card>
          <div class="card-body">
            <h2 class="card-title">A prototyping tool that pays for itself twice</h2>
            <ul>
              <li><strong>De-risks handoff.</strong> Because prototypes use real components, engineering finds out what's actually feasible during design — not mid-sprint.</li>
              <li><strong>Institutional knowledge gets captured structurally</strong> in versioned docs the AI itself reads — not locked away in one person's head or local machine.</li>
              <li><strong>Near-zero cost to run.</strong> No new infrastructure, no new licensing — just design time that's already being spent on prototyping today, spent more consistently.</li>
            </ul>
          </div>
        </jh-card>

        <jh-card>
          <div class="card-body">
            <h2 class="card-title">This isn't hypothetical</h2>
            <ul>
              <li>Real bugs — an empty dropdown, a phantom scrollbar, a folder-naming footgun — were caught by a designer just using it, and fixed the same day.</li>
              <li>The self-update, one-click AI prompt, and onboarding system running this very app were designed and shipped in one continuous stretch of dogfooding. That speed is the product, not just a feature of it.</li>
            </ul>
            <div class="stats">
              <div>
                <span class="stat-value">3 weeks</span>
                <span class="stat-label">since the first commit</span>
              </div>
              <div>
                <span class="stat-value">6</span>
                <span class="stat-label">prototypes built</span>
              </div>
              <div>
                <span class="stat-value">2</span>
                <span class="stat-label">designers actively building</span>
              </div>
              <div>
                <span class="stat-value">$0</span>
                <span class="stat-label">infrastructure cost</span>
              </div>
            </div>
            <p class="stats-note">Snapshot as of 2026-07-08</p>
          </div>
        </jh-card>

        <div class="closing">
          <p>Have an idea, or found something broken? Add it to the board!</p>
          <jh-button appearance="primary" label="Go to Features board" @click=${this._goToBoard}></jh-button>
        </div>
      </div>
    `
  }
}
