import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import '@jack-henry/jh-elements/components/list-group/list-group.js'
import '@jack-henry/jh-elements/components/list-item/list-item.js'
import '@jack-henry/jh-elements/components/input-search/input-search.js'
import '@jack-henry/jh-elements/components/tag/tag.js'
import '@jack-henry/jh-elements/components/tag-group/tag-group.js'
import '@jack-henry/jh-elements/components/table/table.js'
import '@jack-henry/jh-elements/components/table-row/table-row.js'
import '@jack-henry/jh-elements/components/table-header-cell/table-header-cell.js'
import '@jack-henry/jh-elements/components/table-data-cell/table-data-cell.js'
import '@jack-henry/jh-icons/icons-wc/icon-arrow-up-right-from-square.js'
import { RESOURCES, type Resource } from '../data/resources.js'
import { COMPONENT_DOCS } from '../data/components/index.js'
import type { ComponentDoc } from '../data/components/types.js'
// Side-effect import: registers every documented component so previews render.
import '../data/components/_registry.generated.js'

/**
 * Strips Lit bindings (`@event`, `?bool`, `.prop`, `attr=${...}`) so a stored
 * example snippet can be rendered as a static, representative preview. Static
 * attributes (label, appearance, slot…) are preserved.
 */
function previewMarkup(code: string): string {
  return code
    .replace(/\s(?:@|\?|\.)[\w-]+=\$\{[^}]*\}/g, '')
    .replace(/\s[\w-]+=\$\{[^}]*\}/g, '')
}

@customElement('proto-resources')
export class ProtoResources extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .container {
      padding: var(--jh-dimension-600, 3rem);
    }

    .links {
      max-width: 640px;
      margin-bottom: var(--jh-dimension-800, 4rem);
    }

    .section-title {
      margin: 0 0 var(--jh-dimension-200, 1rem);
      font-size: var(--jh-font-size-400, 1.25rem);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled);
    }

    .section-subtitle {
      margin: 0 0 var(--jh-dimension-400, 2rem);
      font-size: var(--jh-font-size-100, 0.875rem);
      color: var(--jh-color-content-secondary-enabled);
    }

    .browser {
      display: grid;
      grid-template-columns: 280px minmax(0, 1fr);
      gap: var(--jh-dimension-600, 3rem);
      align-items: start;
    }

    @media (max-width: 900px) {
      .browser {
        grid-template-columns: 1fr;
      }
    }

    .search {
      display: block;
      margin-bottom: var(--jh-dimension-300, 1.5rem);
    }

    .detail-tag {
      font-size: var(--jh-font-size-100, 0.875rem);
      color: var(--jh-color-content-brand-enabled);
      font-family: ui-monospace, monospace;
    }

    .detail-name {
      margin: 0 0 var(--jh-dimension-100, 0.5rem);
      font-size: var(--jh-font-size-500, 1.5rem);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled);
    }

    .detail-summary {
      margin: 0 0 var(--jh-dimension-500, 2.5rem);
      font-size: var(--jh-font-size-200, 1rem);
      color: var(--jh-color-content-secondary-enabled);
      line-height: var(--jh-font-line-height-300, 1.5);
    }

    .when {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--jh-dimension-500, 2.5rem);
      margin-bottom: var(--jh-dimension-600, 3rem);
    }

    @media (max-width: 640px) {
      .when {
        grid-template-columns: 1fr;
      }
    }

    .block-label {
      margin: 0 0 var(--jh-dimension-200, 1rem);
      font-size: var(--jh-font-size-100, 0.875rem);
      font-weight: var(--jh-font-weight-semibold, 600);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--jh-color-content-secondary-enabled);
    }

    ul {
      margin: 0;
      padding-left: var(--jh-dimension-400, 2rem);
      color: var(--jh-color-content-primary-enabled);
      line-height: var(--jh-font-line-height-300, 1.5);
    }

    li {
      margin-bottom: var(--jh-dimension-100, 0.5rem);
    }

    .group {
      margin-bottom: var(--jh-dimension-600, 3rem);
    }

    .example {
      margin-bottom: var(--jh-dimension-500, 2.5rem);
    }

    .example-title {
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled);
      font-size: var(--jh-font-size-200, 1rem);
    }

    .example-usecase {
      margin: var(--jh-dimension-50, 2px) 0 var(--jh-dimension-300, 1.5rem);
      font-size: var(--jh-font-size-100, 0.875rem);
      color: var(--jh-color-content-secondary-enabled);
    }

    .preview {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--jh-dimension-300, 1.5rem);
      padding: var(--jh-dimension-500, 2.5rem);
      border: 1px solid var(--jh-color-divider-primary);
      border-radius: var(--jh-border-radius-200, 8px) var(--jh-border-radius-200, 8px) 0 0;
      background: var(--jh-color-container-primary-enabled);
    }

    pre {
      margin: 0;
      padding: var(--jh-dimension-400, 2rem);
      border: 1px solid var(--jh-color-divider-primary);
      border-top: none;
      border-radius: 0 0 var(--jh-border-radius-200, 8px) var(--jh-border-radius-200, 8px);
      background: var(--jh-color-container-page);
      overflow-x: auto;
      font-size: var(--jh-font-size-100, 0.875rem);
      line-height: var(--jh-font-line-height-300, 1.5);
      color: var(--jh-color-content-primary-enabled);
    }

    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }

    .empty {
      color: var(--jh-color-content-secondary-enabled);
    }
  `

  @state() private _search = ''
  @state() private _selectedTag = COMPONENT_DOCS[0]?.tag ?? ''

  private _open(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  private get _filtered(): ComponentDoc[] {
    const q = this._search.toLowerCase()
    if (!q) return COMPONENT_DOCS
    return COMPONENT_DOCS.filter(
      d =>
        d.name.toLowerCase().includes(q) ||
        d.tag.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.whenToUse.some(w => w.toLowerCase().includes(q))
    )
  }

  private get _selected(): ComponentDoc | undefined {
    return COMPONENT_DOCS.find(d => d.tag === this._selectedTag)
  }

  render() {
    return html`
      <div class="container">
        <div class="links">
          <h2 class="section-title">Links</h2>
          <jh-list-group>
            ${RESOURCES.map((r: Resource) => html`
              <jh-list-item
                primary-text=${r.title}
                secondary-text=${r.description}
                tabindex="0"
                show-divider
                @click=${() => this._open(r.url)}
              >
                <jh-icon-arrow-up-right-from-square
                  slot="jh-list-item-right"
                  size="small"
                ></jh-icon-arrow-up-right-from-square>
              </jh-list-item>
            `)}
          </jh-list-group>
        </div>

        <h2 class="section-title">Component library</h2>
        <p class="section-subtitle">
          Browse JH components with guidance on when to use them and live examples.
        </p>
        ${COMPONENT_DOCS.length === 0
          ? html`<p class="empty">No components documented yet. Run <code>/add-component</code> to add the first one.</p>`
          : this._renderBrowser()}
      </div>
    `
  }

  private _renderBrowser() {
    const filtered = this._filtered
    return html`
      <div class="browser">
        <div class="list-col">
          <jh-input-search
            class="search"
            label="Search components"
            placeholder="Search by name or use case..."
            @jh-input=${(e: CustomEvent) => { this._search = (e.target as HTMLInputElement).value }}
          ></jh-input-search>
          <jh-list-group>
            ${filtered.map(d => html`
              <jh-list-item
                primary-text=${d.name}
                secondary-text=${d.summary}
                tabindex="0"
                ?selected=${d.tag === this._selectedTag}
                @click=${() => { this._selectedTag = d.tag }}
                @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && (this._selectedTag = d.tag)}
              ></jh-list-item>
            `)}
            ${filtered.length === 0
              ? html`<jh-list-item primary-text="No matches" disabled></jh-list-item>`
              : ''}
          </jh-list-group>
        </div>
        <div class="detail">
          ${this._selected ? this._renderDetail(this._selected) : ''}
        </div>
      </div>
    `
  }

  private _renderDetail(d: ComponentDoc) {
    return html`
      <span class="detail-tag">${d.tag}</span>
      <h3 class="detail-name">${d.name}</h3>
      <p class="detail-summary">${d.summary}</p>

      <div class="when">
        <div>
          <p class="block-label">When to use</p>
          <ul>${d.whenToUse.map(w => html`<li>${w}</li>`)}</ul>
        </div>
        ${d.whenNotToUse?.length
          ? html`
            <div>
              <p class="block-label">When not to use</p>
              <ul>${d.whenNotToUse.map(w => html`<li>${w}</li>`)}</ul>
            </div>
          `
          : ''}
      </div>

      ${d.examples?.length
        ? html`
          <div class="group">
            <p class="block-label">Examples</p>
            ${d.examples.map(ex => html`
              <div class="example">
                <div class="example-title">${ex.title}</div>
                <p class="example-usecase">${ex.useCase}</p>
                <div class="preview">${unsafeHTML(previewMarkup(ex.code))}</div>
                <pre><code>${ex.code}</code></pre>
              </div>
            `)}
          </div>
        `
        : ''}

      ${d.props?.length
        ? html`
          <div class="group">
            <p class="block-label">Props</p>
            <jh-table>
              <jh-table-row slot="header">
                <jh-table-header-cell label="Prop"></jh-table-header-cell>
                <jh-table-header-cell label="Type"></jh-table-header-cell>
                <jh-table-header-cell label="Default"></jh-table-header-cell>
                <jh-table-header-cell label="Description"></jh-table-header-cell>
              </jh-table-row>
              ${d.props.map(p => html`
                <jh-table-row>
                  <jh-table-data-cell>${p.name}${p.required ? ' *' : ''}</jh-table-data-cell>
                  <jh-table-data-cell>${p.type}</jh-table-data-cell>
                  <jh-table-data-cell>${p.default ?? '—'}</jh-table-data-cell>
                  <jh-table-data-cell>${p.description}</jh-table-data-cell>
                </jh-table-row>
              `)}
            </jh-table>
          </div>
        `
        : ''}

      ${d.gotchas?.length
        ? html`
          <div class="group">
            <p class="block-label">Gotchas</p>
            <ul>${d.gotchas.map(g => html`<li>${g}</li>`)}</ul>
          </div>
        `
        : ''}

      ${d.related?.length
        ? html`
          <div class="group">
            <p class="block-label">Related</p>
            <jh-tag-group>
              ${d.related.map(r => html`<jh-tag label=${r}></jh-tag>`)}
            </jh-tag-group>
          </div>
        `
        : ''}
    `
  }
}
