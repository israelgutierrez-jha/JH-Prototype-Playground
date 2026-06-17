import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '@jack-henry/jh-elements/components/card/card.js'
import '@jack-henry/jh-elements/components/tag/tag.js'
import '@jack-henry/jh-elements/components/tag-group/tag-group.js'
import '@jack-henry/jh-elements/components/button/button.js'

export interface TemplateMeta {
  title: string
  description: string
  tags: string[]
  createdAt: string
  navItems?: NavItem[]
}

export interface NavItem {
  label: string
  path?: string
  subItems?: { label: string; path: string }[]
}

export interface PrototypeMeta {
  title: string
  description: string
  designer: string
  tags: string[]
  createdAt: string
  navItems?: NavItem[]
}

@customElement('proto-card')
export class ProtoCard extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .card-inner {
      padding: var(--jh-dimension-300, 1.5rem);
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-200, 1rem);
      height: 100%;
    }

    .card-header {
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-100, 0.5rem);
    }

    .title {
      font-size: var(--jh-font-size-300, 1.125rem);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled, #1a1a1a);
      margin: 0;
    }

    .designer {
      font-size: var(--jh-font-size-100, 0.875rem);
      color: var(--jh-color-content-secondary-enabled, #666);
    }

    .description {
      font-size: var(--jh-font-size-200, 1rem);
      color: var(--jh-color-content-secondary-enabled, #666);
      line-height: var(--jh-font-line-height-300, 1.5);
      flex: 1;
      margin: 0;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
    }

    .date {
      font-size: var(--jh-font-size-100, 0.875rem);
      color: var(--jh-color-content-tertiary-enabled, #999);
    }
  `

  @property() title = ''
  @property() description = ''
  @property() designer = ''
  @property({ type: Array }) tags: string[] = []
  @property() createdAt = ''
  @property() href = ''

  private _navigate() {
    window.location.hash = this.href
  }

  render() {
    return html`
      <jh-card>
        <div class="card-inner">
          <div class="card-header">
            <h2 class="title">${this.title}</h2>
            <span class="designer">by ${this.designer}</span>
          </div>
          <p class="description">${this.description}</p>
          ${this.tags.length ? html`
            <jh-tag-group>
              ${this.tags.map(tag => html`<jh-tag label=${tag}></jh-tag>`)}
            </jh-tag-group>
          ` : ''}
          <div class="footer">
            <span class="date">${this.createdAt}</span>
            <jh-button
              label="View prototype"
              appearance="primary"
              size="small"
              @click=${this._navigate}
            ></jh-button>
          </div>
        </div>
      </jh-card>
    `
  }
}
