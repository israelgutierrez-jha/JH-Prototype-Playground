import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import type { TemplateMeta } from './proto-card.js'
import '@jack-henry/jh-elements/components/card/card.js'
import '@jack-henry/jh-elements/components/button/button.js'
import '@jack-henry/jh-elements/components/tag/tag.js'
import '@jack-henry/jh-elements/components/tag-group/tag-group.js'
import '@jack-henry/jh-elements/components/input-search/input-search.js'

interface TemplateEntry extends TemplateMeta {
  name: string
}

function loadTemplates(): TemplateEntry[] {
  const metaModules = import.meta.glob('../templates/**/meta.ts', {
    eager: true,
  }) as Record<string, { meta: TemplateMeta }>

  return Object.entries(metaModules)
    .map(([path, mod]) => {
      const name = path.replace('../templates/', '').replace('/meta.ts', '')
      return { ...mod.meta, name }
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

@customElement('proto-templates')
export class ProtoTemplates extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    main {
      padding: var(--jh-dimension-600, 3rem);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--jh-dimension-400, 2rem);
    }

    .card-inner {
      padding: var(--jh-dimension-300, 1.5rem);
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-200, 1rem);
      height: 100%;
      box-sizing: border-box;
    }

    .title {
      margin: 0;
      font-size: var(--jh-font-size-300, 1.125rem);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled);
    }

    .description {
      margin: 0;
      font-size: var(--jh-font-size-100, 0.875rem);
      color: var(--jh-color-content-secondary-enabled);
      line-height: var(--jh-font-line-height-300, 1.5);
      flex: 1;
    }

    .footer {
      display: flex;
      justify-content: flex-end;
      margin-top: auto;
    }

    .empty {
      padding: var(--jh-dimension-1200, 6rem) 0;
      color: var(--jh-color-content-secondary-enabled, #666);
    }

    .toolbar {
      padding: var(--jh-dimension-400, 2rem) var(--jh-dimension-600, 3rem);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--jh-dimension-400, 2rem);
    }

    .count {
      font-size: var(--jh-font-size-100, 0.875rem);
      color: var(--jh-color-content-secondary-enabled, #666);
    }

    .empty h2 {
      font-size: var(--jh-font-size-400, 1.25rem);
      margin: 0 0 var(--jh-dimension-200, 1rem);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled);
    }
  `

  @state() private _search = ''
  private _all = loadTemplates()

  private get _filtered() {
    const q = this._search.toLowerCase()
    if (!q) return this._all
    return this._all.filter(
      t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
    )
  }

  private _navigate(t: TemplateEntry) {
    window.location.hash = `#/templates/${t.name}`
  }

  render() {
    const templates = this._filtered

    return html`
      <div class="toolbar">
        <span class="count">${this._all.length} template${this._all.length !== 1 ? 's' : ''}</span>
        <jh-input-search
          label="Search templates"
          placeholder="Search by name or tag..."
          style="min-width: 280px"
          @jh-input=${(e: CustomEvent) => { this._search = (e.target as HTMLInputElement).value }}
        ></jh-input-search>
      </div>

      <main>
        ${templates.length === 0 && this._search ? html`
          <div class="empty">
            <h2>No results for "${this._search}"</h2>
          </div>
        ` : templates.length === 0 ? html`
          <div class="empty">
            <h2>No templates yet</h2>
            <p>Add a folder to <code>src/templates/</code> with a <code>meta.ts</code> and <code>index.ts</code> to get started.</p>
          </div>
        ` : html`
          <div class="grid">
            ${templates.map(t => html`
              <jh-card>
                <div class="card-inner">
                  <h2 class="title">${t.title}</h2>
                  <p class="description">${t.description}</p>
                  ${t.tags.length ? html`
                    <jh-tag-group>
                      ${t.tags.map(tag => html`<jh-tag label=${tag}></jh-tag>`)}
                    </jh-tag-group>
                  ` : ''}
                  <div class="footer">
                    <jh-button
                      label="View template"
                      appearance="primary"
                      size="small"
                      @click=${() => this._navigate(t)}
                    ></jh-button>
                  </div>
                </div>
              </jh-card>
            `)}
          </div>
        `}
      </main>
    `
  }
}
