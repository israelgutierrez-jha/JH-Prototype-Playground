import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
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
import '@jack-henry/jh-elements/components/button/button.js'
import '@jack-henry/jh-icons/icons-wc/icon-arrow-up-right-from-square.js'
import { pageHeaderStyles } from '../styles/page-header.js'
import { RESOURCES, type Resource } from '../data/resources.js'
import { COMPONENT_DOCS } from '../data/components/index.js'
import type { ComponentDoc, ComponentProp } from '../data/components/types.js'
import { DESIGNER_COMMANDS, type DesignerCommand } from '../data/commands.js'
import { aiActionLabel, getAiTool, runAiPrompt } from '../utils/ai-deeplink.js'
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

/**
 * A stored example can only be shown as a live preview when it is static HTML.
 * Property bindings (`.prop=${...}`, e.g. `jha-advanced-table`'s `.columns`)
 * can only be set from JS, and any `${...}` left after stripping attribute
 * bindings is dynamic child content (e.g. `${rows.map(...)}`). Either would
 * render as broken text, so those examples show the code alone.
 */
function canPreview(code: string): boolean {
  if (/\s\.[\w-]+=\$\{/.test(code)) return false
  return !previewMarkup(code).includes('${')
}

@customElement('proto-resources')
export class ProtoResources extends LitElement {
  static styles = [
    pageHeaderStyles,
    css`
    :host {
      display: block;
    }

    .page-body {
      padding: var(--jh-dimension-500, 2.5rem) var(--jh-dimension-600, 3rem) var(--jh-dimension-600, 3rem);
    }

    .links {
      max-width: 640px;
    }

    .command-actions {
      margin-top: var(--jh-dimension-400, 2rem);
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
      line-height: 1.5;
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
      line-height: 1.5;
    }

    li {
      margin-bottom: var(--jh-dimension-100, 0.5rem);
    }

    .group {
      margin-bottom: var(--jh-dimension-600, 3rem);
    }

    .advanced {
      margin-top: var(--jh-dimension-300, 1.5rem);
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
      line-height: 1.5;
      color: var(--jh-color-content-primary-enabled);
    }

    /* When an example can't be previewed live, the code block stands alone and
       needs its full border and rounded corners back. */
    pre.code-only {
      border-top: 1px solid var(--jh-color-divider-primary);
      border-radius: var(--jh-border-radius-200, 8px);
    }

    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }

    .empty {
      color: var(--jh-color-content-secondary-enabled);
    }
  `,
  ]

  /** Which sub-page to render — driven by local (header) navigation. */
  @property() page: 'links' | 'components' | 'commands' = 'links'

  @state() private _search = ''
  @state() private _selectedTag = COMPONENT_DOCS[0]?.tag ?? ''
  @state() private _showAdvanced = false
  @state() private _selectedCommand = DESIGNER_COMMANDS[0]?.command ?? ''
  @state() private _commandActionOutcome: 'opened' | 'copied' | null = null

  private get _selectedCommandDoc() {
    return DESIGNER_COMMANDS.find(c => c.command === this._selectedCommand)
  }

  private _selectCommand(command: string) {
    this._selectedCommand = command
    this._commandActionOutcome = null
  }

  private async _openCommand(prompt: string) {
    this._commandActionOutcome = await runAiPrompt(prompt)
  }

  private _select(tag: string) {
    this._selectedTag = tag
    this._showAdvanced = false
  }

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
    if (this.page === 'components') return this._renderComponents()
    if (this.page === 'commands') return this._renderCommands()
    return this._renderLinks()
  }

  private _renderLinks() {
    return html`
      <div class="page-header">
        <div class="page-header-text">
          <h1 class="page-title">Resources</h1>
          <p class="page-subtitle">
            Handy references and tools for building JH prototypes.
          </p>
        </div>
      </div>
      <div class="page-body">
        <div class="links">
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
      </div>
    `
  }

  private _renderCommands() {
    return html`
      <div class="page-header">
        <div class="page-header-text">
          <h1 class="page-title">Commands</h1>
          <p class="page-subtitle">
            Every slash command available to you in Claude Code or Cursor — what it does, when
            to reach for it, and a button to open it directly in your AI tool.
          </p>
        </div>
      </div>
      <div class="page-body">
        <div class="browser">
          <div class="list-col">
            <jh-list-group>
              ${DESIGNER_COMMANDS.map(cmd => html`
                <jh-list-item
                  primary-text=${cmd.command}
                  secondary-text=${cmd.title}
                  tabindex="0"
                  ?selected=${cmd.command === this._selectedCommand}
                  @click=${() => this._selectCommand(cmd.command)}
                  @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && this._selectCommand(cmd.command)}
                ></jh-list-item>
              `)}
            </jh-list-group>
          </div>
          <div class="detail">
            ${this._selectedCommandDoc ? this._renderCommandDetail(this._selectedCommandDoc) : ''}
          </div>
        </div>
      </div>
    `
  }

  private _renderCommandDetail(cmd: DesignerCommand) {
    return html`
      <span class="detail-tag">${cmd.command}</span>
      <h3 class="detail-name">${cmd.title}</h3>
      <p class="detail-summary">${cmd.summary}</p>

      <div>
        <p class="block-label">When to use</p>
        <ul>${cmd.whenToUse.map(w => html`<li>${w}</li>`)}</ul>
      </div>

      <div class="command-actions">
        <jh-button
          appearance="secondary"
          size="small"
          label=${this._commandActionOutcome
            ? (this._commandActionOutcome === 'opened' ? 'Opened!' : 'Copied!')
            : aiActionLabel(getAiTool())}
          @click=${() => this._openCommand(cmd.prompt)}
        ></jh-button>
      </div>
    `
  }

  private _renderComponents() {
    return html`
      <div class="page-header">
        <div class="page-header-text">
          <h1 class="page-title">Components</h1>
          <p class="page-subtitle">
            Browse JH components with guidance on when to use them and live examples.
          </p>
        </div>
      </div>
      <div class="page-body">
        ${COMPONENT_DOCS.length === 0
          ? html`<p class="empty">No components documented yet. Run <code>/document-component</code> to add the first one.</p>`
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
                @click=${() => this._select(d.tag)}
                @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && this._select(d.tag)}
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

  private _propTable(props: ComponentProp[]) {
    return html`
      <jh-table>
        <jh-table-row slot="header">
          <jh-table-header-cell label="Prop"></jh-table-header-cell>
          <jh-table-header-cell label="Type"></jh-table-header-cell>
          <jh-table-header-cell label="Default"></jh-table-header-cell>
          <jh-table-header-cell label="Description"></jh-table-header-cell>
        </jh-table-row>
        ${props.map(p => html`
          <jh-table-row>
            <jh-table-data-cell>${p.name}${p.required ? ' *' : ''}</jh-table-data-cell>
            <jh-table-data-cell>${p.type}</jh-table-data-cell>
            <jh-table-data-cell>${p.default ?? '—'}</jh-table-data-cell>
            <jh-table-data-cell>${p.description}</jh-table-data-cell>
          </jh-table-row>
        `)}
      </jh-table>
    `
  }

  private _renderProps(d: ComponentDoc) {
    if (!d.props?.length) return ''
    const common = d.props.filter(p => p.tier !== 'advanced')
    const advanced = d.props.filter(p => p.tier === 'advanced')
    return html`
      <div class="group">
        <p class="block-label">Props</p>
        ${common.length ? this._propTable(common) : ''}
        ${advanced.length
          ? html`
            <div class="advanced">
              <jh-button
                appearance="tertiary"
                size="small"
                label=${this._showAdvanced
                  ? 'Hide advanced props'
                  : `Show ${advanced.length} advanced prop${advanced.length !== 1 ? 's' : ''} (a11y & native passthrough)`}
                @click=${() => { this._showAdvanced = !this._showAdvanced }}
              ></jh-button>
              ${this._showAdvanced ? this._propTable(advanced) : ''}
            </div>
          `
          : ''}
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
            ${d.examples.map(ex => {
              const previewable = canPreview(ex.code)
              return html`
                <div class="example">
                  <div class="example-title">${ex.title}</div>
                  <p class="example-usecase">${ex.useCase}</p>
                  ${previewable
                    ? html`<div class="preview">${unsafeHTML(previewMarkup(ex.code))}</div>`
                    : ''}
                  <pre class=${previewable ? '' : 'code-only'}><code>${ex.code}</code></pre>
                </div>
              `
            })}
          </div>
        `
        : ''}

      ${this._renderProps(d)}

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
