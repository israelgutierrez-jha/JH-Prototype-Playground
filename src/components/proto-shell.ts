import { LitElement, html, css } from 'lit'
import { customElement, property, state, query } from 'lit/decorators.js'
import { createRef, ref } from 'lit/directives/ref.js'
import hljs from 'highlight.js/lib/core'
import typescriptLanguage from 'highlight.js/lib/languages/typescript'
import hljsTheme from 'highlight.js/styles/a11y-dark.css?raw'
import '@jack-henry/jh-elements/components/notification/notification.js'
import '@jack-henry/jh-elements/components/button/button.js'
import '@jack-henry/jh-elements/components/card/card.js'
import '@jack-henry/jh-elements/components/divider/divider.js'
import '@jack-henry/jh-elements/components/input-url/input-url.js'
import '@jack-henry/jh-icons/icons-wc/icon-pencil.js'
import '@jack-henry/jh-icons/icons-wc/icon-crosshairs.js'
import '@jack-henry/jh-icons/icons-wc/icon-link.js'
import '@jack-henry/jh-icons/icons-wc/icon-arrow-up-right-from-square.js'
import '@jack-henry/jh-icons/icons-wc/icon-code.js'
import '@jkhy/platform-tools/components/jh-platform-header.js'
import '@jkhy/platform-tools/components/jh-platform-drawer.js'
import './proto-settings-dialog.js'
import './proto-password-gate.js'
import type { ProtoSettingsSavedDetail } from './proto-settings-dialog.js'
import type { PrototypeMeta } from './proto-card.js'
import { formatDesignerName } from '../utils/designer-profile.js'

hljs.registerLanguage('typescript', typescriptLanguage)

const IS_EXTERNAL_BUILD = import.meta.env.VITE_EXTERNAL_BUILD === 'true'

// The "Related links" panel always has the same two sections, so its
// footprint is known ahead of render — no need to measure it (and risk a
// flash of mispositioned content) before deciding where it fits. Mirrors
// computeMenuPosition in proto-features.ts (not exported from there, so
// reimplemented here rather than reaching into an unrelated component).
const LINKS_PANEL_WIDTH = 320
const LINKS_PANEL_HEIGHT_ESTIMATE = 300
const LINKS_PANEL_GAP = 4

function computeLinksPanelPosition(anchor: DOMRect): { top: number; left: number } {
  const fitsBelow = anchor.bottom + LINKS_PANEL_GAP + LINKS_PANEL_HEIGHT_ESTIMATE <= window.innerHeight
  const top = fitsBelow ? anchor.bottom + LINKS_PANEL_GAP : anchor.top - LINKS_PANEL_GAP - LINKS_PANEL_HEIGHT_ESTIMATE

  const rightAligned = anchor.right - LINKS_PANEL_WIDTH
  const left = rightAligned >= LINKS_PANEL_GAP ? rightAligned : anchor.left

  return {
    top: Math.max(LINKS_PANEL_GAP, Math.min(top, window.innerHeight - LINKS_PANEL_GAP - LINKS_PANEL_HEIGHT_ESTIMATE)),
    left: Math.max(LINKS_PANEL_GAP, Math.min(left, window.innerWidth - LINKS_PANEL_GAP - LINKS_PANEL_WIDTH)),
  }
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//.test(value)
}

@customElement('proto-shell')
export class ProtoShell extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      --jh-platform-header-vertical-padding: 12px;
      --jh-platform-header-horizontal-padding: 28px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: var(--jh-dimension-300, 0.75rem);
    }

    .designer-badge {
      font-size: var(--jh-font-size-100, 0.875rem);
      color: var(--jh-color-content-secondary-enabled, #666);
    }

    .proto-area {
      flex: 1;
      overflow: auto;
      display: flex;
      flex-direction: column;
    }

    /* Gives the mounted prototype element a definite height (not just
       auto/shrink-to-content), so a prototype can opt into height: 100%
       on its own :host for full-height layouts (e.g. a sidebar that
       reaches the bottom of the content area). Prototypes that don't
       need this are unaffected — overflow on .proto-area still scrolls
       content taller than the available space. */
    .proto-mount {
      flex: 1;
      min-height: 0;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--jh-dimension-1200, 6rem);
      color: var(--jh-color-content-secondary-enabled, #666);
    }

    .error-wrap {
      padding: var(--jh-dimension-400, 2rem);
    }

    /*
     * jh-card clips overflow (rounded corners), so this can't live inside
     * the header as an absolutely-positioned child — it renders as a single
     * fixed-position overlay instead, positioned from the trigger button's
     * screen coordinates (see _linksMenuPos / computeLinksPanelPosition).
     */
    .links-panel {
      position: fixed;
      width: ${LINKS_PANEL_WIDTH}px;
      z-index: var(--jh-z-index-positive-1000, 1000);
    }

    .links-section {
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-200, 0.5rem);
      padding: var(--jh-dimension-300, 0.75rem) 0;
    }

    .links-section-label {
      font-size: var(--jh-font-size-300, 0.75rem);
      color: var(--jh-color-content-secondary-enabled);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .links-row {
      display: flex;
      align-items: center;
      gap: var(--jh-dimension-200, 0.5rem);
    }

    .links-row jh-input-url {
      flex: 1;
      min-width: 0;
    }

    .links-meta {
      font-size: var(--jh-font-size-350, 0.875rem);
      color: var(--jh-color-content-secondary-enabled);
    }

    /* Overlay layout renders via the native Popover API (top layer), so it
       can never collide with or be squeezed by a prototype's own layout —
       see CLAUDE.md's Platform Shell section. Transparent backdrop keeps the
       prototype fully visible/undimmed underneath instead of the default
       dark scrim, since the point is to compare code against the running
       prototype, not hide it. */
    .source-drawer {
      --jh-drawer-overlay-backdrop: transparent;
      --jh-platform-drawer-width: 560px;
    }

    .source-pre {
      margin: 0;
      padding: var(--jh-dimension-400, 1rem);
      overflow: auto;
      height: 100%;
      font-size: var(--jh-font-size-350, 0.875rem);
    }
  `

  @property() designer = ''
  @property() name = ''
  @property({ type: Boolean }) inspecting = false

  @state() private _loading = true
  @state() private _error = ''
  @state() private _settingsOpen = false
  @state() private _titleOverride: string | null = null
  @state() private _descriptionOverride: string | null = null
  @state() private _publicOverride: boolean | null = null
  @state() private _hasPasswordOverride: boolean | null = null

  @state() private _linksMenuOpen = false
  @state() private _linksMenuPos: { top: number; left: number } | null = null
  @state() private _figmaEditing = false
  @state() private _jiraEditing = false
  @state() private _draftFigmaLink = ''
  @state() private _draftJiraLink = ''
  @state() private _savingFigma = false
  @state() private _savingJira = false
  @state() private _linksError = ''
  @state() private _figmaLinkOverride: string | null = null
  @state() private _figmaFrameNameOverride: string | null = null
  @state() private _jiraLinkOverride: string | null = null
  @state() private _jiraTicketKeyOverride: string | null = null
  @state() private _jiraTicketSummaryOverride: string | null = null

  @state() private _sourceOpen = false
  @state() private _sourceText = ''
  @state() private _sourceCopied = false

  private _containerRef = createRef<HTMLDivElement>()
  private _linksPanelRef = createRef<HTMLDivElement>()
  @query('#source-code') private _sourceCodeEl?: HTMLElement
  private _protoEl: Element | null = null
  private _loadedKey = ''

  private _protoModules = import.meta.glob('../prototypes/**/index.ts') as Record<
    string,
    () => Promise<{ default: CustomElementConstructor }>
  >

  private _metaModules = import.meta.glob('../prototypes/**/meta.ts', { eager: true }) as Record<
    string,
    { meta: PrototypeMeta }
  >

  // Read-only, so a plain Vite `?raw` glob is enough — no dev-server endpoint
  // needed (unlike /__proto-api/meta, which exists only because that feature
  // writes back to disk).
  private _sourceModules = import.meta.glob('../prototypes/**/index.ts', {
    query: '?raw',
    import: 'default',
  }) as Record<string, () => Promise<string>>

  private get _protoMeta(): PrototypeMeta | undefined {
    const key = `../prototypes/${this.designer}/${this.name}/meta.ts`
    return this._metaModules[key]?.meta
  }

  private get _protoTitle(): string {
    return this._titleOverride ?? this._protoMeta?.title ?? this.name
  }

  private get _protoDescription(): string {
    return this._descriptionOverride ?? this._protoMeta?.description ?? ''
  }

  private get _protoPublic(): boolean {
    return this._publicOverride ?? this._protoMeta?.public ?? false
  }

  private get _protoHasPassword(): boolean {
    return this._hasPasswordOverride ?? !!this._protoMeta?.passwordHash
  }

  private get _protoFigmaLink(): string {
    return this._figmaLinkOverride ?? this._protoMeta?.figmaLink ?? ''
  }

  private get _protoFigmaFrameName(): string {
    return this._figmaFrameNameOverride ?? this._protoMeta?.figmaFrameName ?? ''
  }

  private get _protoJiraLink(): string {
    return this._jiraLinkOverride ?? this._protoMeta?.jiraLink ?? ''
  }

  private get _protoJiraTicketKey(): string {
    return this._jiraTicketKeyOverride ?? this._protoMeta?.jiraTicketKey ?? ''
  }

  private get _protoJiraTicketSummary(): string {
    return this._jiraTicketSummaryOverride ?? this._protoMeta?.jiraTicketSummary ?? ''
  }

  private async _loadPrototype(designer: string, name: string) {
    const key = `../prototypes/${designer}/${name}/index.ts`
    if (this._loadedKey === key) return
    this._loadedKey = key

    try {
      if (!this._protoModules[key]) {
        this._error = `Prototype "${designer}/${name}" not found.`
        this._loading = false
        return
      }

      const mod = await this._protoModules[key]()
      const tagName = `proto-${designer}-${name}`
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')

      if (!customElements.get(tagName)) {
        customElements.define(tagName, mod.default)
      }

      this._protoEl = document.createElement(tagName)
      this._loading = false
    } catch (err) {
      this._error = `Failed to load prototype: ${err}`
      this._loading = false
    }
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has('designer') || changed.has('name')) {
      if (this.designer && this.name) {
        this._loading = true
        this._error = ''
        this._protoEl = null
        this._loadedKey = ''
        this._titleOverride = null
        this._descriptionOverride = null
        this._publicOverride = null
        this._hasPasswordOverride = null
        this._figmaLinkOverride = null
        this._figmaFrameNameOverride = null
        this._jiraLinkOverride = null
        this._jiraTicketKeyOverride = null
        this._jiraTicketSummaryOverride = null
        this._closeLinksMenu()
        this._sourceOpen = false
        this._sourceText = ''
        this._sourceCopied = false
        this._loadPrototype(this.designer, this.name)
      }
    }

    if (!this._loading && !this._error && this._protoEl && this._containerRef.value) {
      const container = this._containerRef.value
      if (!container.contains(this._protoEl)) {
        container.replaceChildren(this._protoEl)
      }
    }

    if (this._sourceOpen && this._sourceText && this._sourceCodeEl) {
      this._sourceCodeEl.innerHTML = hljs.highlight(this._sourceText, { language: 'typescript' }).value
    }
  }

  private _onSettingsSaved(e: CustomEvent<ProtoSettingsSavedDetail>) {
    this._titleOverride = e.detail.title
    this._descriptionOverride = e.detail.description
    this._publicOverride = e.detail.public
    this._hasPasswordOverride = e.detail.hasPassword
    this._settingsOpen = false
  }

  private _closeLinksMenu = () => {
    this._linksMenuOpen = false
    this._linksMenuPos = null
    this._figmaEditing = false
    this._jiraEditing = false
    this._linksError = ''
  }

  // Checking composedPath() containment (rather than relying on a
  // stopPropagation() call somewhere inside the panel) is what correctly
  // survives shadow-DOM retargeting inside jh-button/jh-input-url — a plain
  // ancestor stopPropagation() was observed to not reliably stop the click
  // dispatched by jh-button's internal handling from reaching this listener.
  private _onWindowClickForLinks = (e: Event) => {
    if (!this._linksMenuOpen) return
    const panel = this._linksPanelRef.value
    if (panel && e.composedPath().includes(panel)) return
    this._closeLinksMenu()
  }

  private _onWindowKeydownForLinks = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this._linksMenuOpen) this._closeLinksMenu()
  }

  // Scroll events don't bubble, so a capture-phase listener on window is the
  // only way to hear about scrolling and close the panel rather than leave
  // it misaligned with its trigger.
  private _onWindowScrollForLinks = () => {
    if (this._linksMenuOpen) this._closeLinksMenu()
  }

  connectedCallback() {
    super.connectedCallback()
    window.addEventListener('click', this._onWindowClickForLinks)
    window.addEventListener('keydown', this._onWindowKeydownForLinks)
    window.addEventListener('scroll', this._onWindowScrollForLinks, true)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener('click', this._onWindowClickForLinks)
    window.removeEventListener('keydown', this._onWindowKeydownForLinks)
    window.removeEventListener('scroll', this._onWindowScrollForLinks, true)
  }

  private _toggleLinksMenu(e: Event) {
    e.stopPropagation()
    if (this._linksMenuOpen) {
      this._closeLinksMenu()
      return
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    this._linksMenuPos = computeLinksPanelPosition(rect)
    this._draftFigmaLink = this._protoFigmaLink
    this._draftJiraLink = this._protoJiraLink
    this._figmaEditing = !this._protoFigmaLink
    this._jiraEditing = !this._protoJiraLink
    this._linksError = ''
    this._linksMenuOpen = true
  }

  private _openExternalLink(url: string) {
    if (!isHttpUrl(url)) return
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  private async _saveLinksField(field: 'figmaLink' | 'jiraLink', value: string) {
    const trimmed = value.trim()
    if (field === 'figmaLink') this._savingFigma = true
    else this._savingJira = true
    this._linksError = ''

    try {
      const res = await fetch('/__proto-api/meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designer: this.designer, name: this.name, [field]: trimmed }),
      })
      const result = await res.json()
      if (!res.ok || !result.ok) {
        throw new Error(result.error || 'Failed to save link.')
      }
      this._figmaLinkOverride = result.figmaLink
      this._figmaFrameNameOverride = result.figmaFrameName
      this._jiraLinkOverride = result.jiraLink
      this._jiraTicketKeyOverride = result.jiraTicketKey
      this._jiraTicketSummaryOverride = result.jiraTicketSummary
      if (field === 'figmaLink') this._figmaEditing = false
      else this._jiraEditing = false
    } catch (err) {
      this._linksError = err instanceof Error ? err.message : 'Failed to save link.'
    } finally {
      if (field === 'figmaLink') this._savingFigma = false
      else this._savingJira = false
    }
  }

  private async _toggleSourceDrawer() {
    if (this._sourceOpen) {
      this._sourceOpen = false
      return
    }
    if (!this._sourceText) {
      const key = `../prototypes/${this.designer}/${this.name}/index.ts`
      const loadSource = this._sourceModules[key]
      if (loadSource) {
        this._sourceText = await loadSource()
      }
    }
    this._sourceOpen = true
  }

  private async _copySource() {
    if (!this._sourceText) return
    await navigator.clipboard.writeText(this._sourceText)
    this._sourceCopied = true
    setTimeout(() => { this._sourceCopied = false }, 2000)
  }

  render() {
    return html`
      <jh-platform-header title=${this._protoTitle} .navItems=${this._protoMeta?.navItems ?? []}>
        <div slot="header-right" class="header-right">
          <span class="designer-badge">by ${formatDesignerName(this._protoMeta?.designerName || this.designer)}</span>
          ${IS_EXTERNAL_BUILD ? '' : html`
            <jh-button
              appearance="tertiary"
              size="small"
              accessible-label="Prototype settings"
              @click=${() => { this._settingsOpen = true }}
            >
              <jh-icon-pencil slot="jh-button-icon-left" size="small"></jh-icon-pencil>
            </jh-button>
            <jh-button
              appearance="tertiary"
              size="small"
              accessible-label="Related links (Figma, Jira)"
              @click=${(e: Event) => this._toggleLinksMenu(e)}
            >
              <jh-icon-link slot="jh-button-icon-left" size="small"></jh-icon-link>
            </jh-button>
            <jh-button
              appearance="tertiary"
              size="small"
              accessible-label="View source"
              @click=${() => this._toggleSourceDrawer()}
            >
              <jh-icon-code slot="jh-button-icon-left" size="small"></jh-icon-code>
            </jh-button>
            <jh-button
              appearance=${this.inspecting ? 'primary' : 'secondary'}
              size="small"
              accessible-label=${this.inspecting ? 'Turn off inspect mode' : 'Inspect components (hover to identify)'}
              @click=${() => this.dispatchEvent(new CustomEvent('toggle-inspect', { bubbles: true, composed: true }))}
            >
              <jh-icon-crosshairs slot="jh-button-icon-left" size="small"></jh-icon-crosshairs>
            </jh-button>
          `}
        </div>
      </jh-platform-header>

      ${!IS_EXTERNAL_BUILD && this._linksMenuOpen && this._linksMenuPos ? html`
        <div
          class="links-panel"
          style="top: ${this._linksMenuPos.top}px; left: ${this._linksMenuPos.left}px;"
          ${ref(this._linksPanelRef)}
        >
          <jh-card>
            ${this._linksError ? html`<jh-notification type="alert" appearance="negative">${this._linksError}</jh-notification>` : ''}

            <div class="links-section">
              <span class="links-section-label">Figma</span>
              ${!this._figmaEditing && this._protoFigmaLink ? html`
                <div class="links-row">
                  <jh-button
                    appearance="tertiary"
                    size="small"
                    label=${`Open in Figma${this._protoFigmaFrameName ? ' — ' + this._protoFigmaFrameName : ''}`}
                    @click=${() => this._openExternalLink(this._protoFigmaLink)}
                  >
                    <jh-icon-arrow-up-right-from-square slot="jh-button-icon-left" size="small"></jh-icon-arrow-up-right-from-square>
                  </jh-button>
                  <jh-button
                    appearance="tertiary"
                    size="x-small"
                    accessible-label="Edit Figma link"
                    @click=${() => { this._figmaEditing = true; this._draftFigmaLink = this._protoFigmaLink }}
                  >
                    <jh-icon-pencil slot="jh-button-icon-left" size="small"></jh-icon-pencil>
                  </jh-button>
                </div>
              ` : html`
                <div class="links-row">
                  <jh-input-url
                    label="Figma link"
                    helper-text="Paste the Figma frame or file URL"
                    .value=${this._draftFigmaLink}
                    @jh-input=${(e: CustomEvent<{ value: string }>) => { this._draftFigmaLink = e.detail.value }}
                    @jh-change=${(e: CustomEvent<{ value: string }>) => { this._draftFigmaLink = e.detail.value }}
                  ></jh-input-url>
                  <jh-button
                    appearance="primary"
                    size="small"
                    label="Save"
                    ?pending=${this._savingFigma}
                    @click=${() => this._saveLinksField('figmaLink', this._draftFigmaLink)}
                  ></jh-button>
                </div>
              `}
            </div>

            <jh-divider></jh-divider>

            <div class="links-section">
              <span class="links-section-label">Jira</span>
              ${!this._jiraEditing && this._protoJiraLink ? html`
                <div class="links-row">
                  <jh-button
                    appearance="tertiary"
                    size="small"
                    label="Open Jira ticket"
                    @click=${() => this._openExternalLink(this._protoJiraLink)}
                  >
                    <jh-icon-arrow-up-right-from-square slot="jh-button-icon-left" size="small"></jh-icon-arrow-up-right-from-square>
                  </jh-button>
                  <jh-button
                    appearance="tertiary"
                    size="x-small"
                    accessible-label="Edit Jira link"
                    @click=${() => { this._jiraEditing = true; this._draftJiraLink = this._protoJiraLink }}
                  >
                    <jh-icon-pencil slot="jh-button-icon-left" size="small"></jh-icon-pencil>
                  </jh-button>
                </div>
                ${this._protoJiraTicketKey || this._protoJiraTicketSummary ? html`
                  <span class="links-meta">${this._protoJiraTicketKey}${this._protoJiraTicketKey && this._protoJiraTicketSummary ? ' — ' : ''}${this._protoJiraTicketSummary}</span>
                ` : ''}
              ` : html`
                <div class="links-row">
                  <jh-input-url
                    label="Jira ticket link"
                    helper-text="Paste the Jira ticket URL"
                    .value=${this._draftJiraLink}
                    @jh-input=${(e: CustomEvent<{ value: string }>) => { this._draftJiraLink = e.detail.value }}
                    @jh-change=${(e: CustomEvent<{ value: string }>) => { this._draftJiraLink = e.detail.value }}
                  ></jh-input-url>
                  <jh-button
                    appearance="primary"
                    size="small"
                    label="Save"
                    ?pending=${this._savingJira}
                    @click=${() => this._saveLinksField('jiraLink', this._draftJiraLink)}
                  ></jh-button>
                </div>
              `}
            </div>
          </jh-card>
        </div>
      ` : ''}

      <div class="proto-area">
        ${this._loading ? html`
          <div class="loading">Loading prototype…</div>
        ` : this._error ? html`
          <div class="error-wrap">
            <jh-notification type="alert" appearance="negative">${this._error}</jh-notification>
          </div>
        ` : IS_EXTERNAL_BUILD ? html`
          <proto-password-gate
            class="proto-mount"
            .passwordHash=${this._protoMeta?.passwordHash ?? ''}
            unlockKey=${`proto:${this.designer}/${this.name}`}
            label="This prototype requires a password to view."
          >
            <div class="proto-mount" ${ref(this._containerRef)}></div>
          </proto-password-gate>
        ` : html`
          <div class="proto-mount" ${ref(this._containerRef)}></div>
        `}
      </div>

      ${IS_EXTERNAL_BUILD ? '' : html`
        <proto-settings-dialog
          .open=${this._settingsOpen}
          .designer=${this.designer}
          .designerName=${this._protoMeta?.designerName ?? ''}
          .name=${this.name}
          .initialTitle=${this._protoTitle}
          .initialDescription=${this._protoDescription}
          .initialPublic=${this._protoPublic}
          .initialHasPassword=${this._protoHasPassword}
          @close=${() => { this._settingsOpen = false }}
          @saved=${this._onSettingsSaved}
        ></proto-settings-dialog>

        <jh-platform-drawer
          class="source-drawer"
          layout="overlay"
          .heading=${`${this._protoTitle} — source`}
          .open=${this._sourceOpen}
          @close-overlay=${() => { this._sourceOpen = false }}
        >
          <style>${hljsTheme}</style>
          <div slot="drawer-actions">
            <jh-button
              appearance="tertiary"
              size="small"
              label=${this._sourceCopied ? 'Copied!' : 'Copy'}
              @click=${() => this._copySource()}
            ></jh-button>
          </div>
          <pre class="source-pre"><code id="source-code" class="language-typescript"></code></pre>
        </jh-platform-drawer>
      `}
    `
  }
}
