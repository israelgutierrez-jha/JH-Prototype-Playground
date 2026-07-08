import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { createRef, ref } from 'lit/directives/ref.js'
import { pageHeaderStyles } from '../styles/page-header.js'
import type { PrototypeMeta } from './proto-card.js'
import { EXTERNAL_LINKS, type ExternalPrototypeLink as ExternalEntry } from '../data/external-links.js'
import '@jack-henry/jh-elements/components/input-search/input-search.js'
import '@jack-henry/jh-elements/components/list-group/list-group.js'
import '@jack-henry/jh-elements/components/list-item/list-item.js'
import '@jack-henry/jh-elements/components/button/button.js'
import '@jack-henry/jh-elements/components/notification/notification.js'
import '@jack-henry/jh-elements/components/input/input.js'
import '@jack-henry/jh-elements/components/input-url/input-url.js'
import '@jack-henry/jh-elements/components/input-textarea/input-textarea.js'
import '@jack-henry/jh-icons/icons-wc/icon-arrow-up-right-from-square.js'
import { runAiPrompt } from '../utils/ai-deeplink.js'
import { designerProfileReady, getDesignerName } from '../utils/designer-profile.js'

const NEW_PROTOTYPE_PROMPT =
  'I want to create a new prototype in the JH Prototype Playground. ' +
  'Please run /new-prototype to scaffold it, then help me build it using only JH components.'

/**
 * External links persist through the dev-only `/__proto-api/external-links`
 * endpoint (see vite.config.ts), which reads/writes the real
 * `src/data/external-links.json` — same pattern as prototype settings.
 */
async function addExternalLink(fields: {
  title: string
  url: string
  designer: string
  description: string
}): Promise<ExternalEntry> {
  const res = await fetch('/__proto-api/external-links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  })
  const result = await res.json()
  if (!res.ok || !result.ok) throw new Error(result.error || 'Failed to save the link.')
  return result.entry
}

async function removeExternalLink(id: string): Promise<void> {
  const res = await fetch('/__proto-api/external-links', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  })
  const result = await res.json()
  if (!res.ok || !result.ok) throw new Error(result.error || 'Failed to remove the link.')
}

interface PrototypeEntry extends PrototypeMeta {
  designer: string
  name: string
}

/** Common shape the gallery list renders, from both local protos and links. */
interface GalleryItem {
  kind: 'local' | 'external'
  title: string
  description: string
  designer: string
  createdAt: string
  tags: string[]
  href?: string
  id?: string
  url?: string
}

interface MonthGroup {
  label: string
  key: string
  entries: GalleryItem[]
}

function loadPrototypes(): PrototypeEntry[] {
  const metaModules = import.meta.glob('../prototypes/**/meta.ts', {
    eager: true,
  }) as Record<string, { meta: PrototypeMeta }>

  return Object.entries(metaModules)
    .filter(([path]) => !path.includes('/_template/'))
    .map(([path, mod]) => {
      const stripped = path
        .replace('../prototypes/', '')
        .replace('/meta.ts', '')
      const parts = stripped.split('/')
      return { ...mod.meta, designer: parts[0], name: parts.slice(1).join('/') }
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

function monthKey(createdAt: string) {
  return createdAt.slice(0, 7)
}

function monthLabel(key: string) {
  const [year, month] = key.split('-').map(Number)
  const now = new Date()
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  if (key === currentKey) return 'This month'
  const opts: Intl.DateTimeFormatOptions =
    year === now.getFullYear() ? { month: 'long' } : { month: 'long', year: 'numeric' }
  return new Date(year, month - 1).toLocaleDateString('en-US', opts)
}

function groupByMonth(entries: GalleryItem[]): MonthGroup[] {
  const map = new Map<string, GalleryItem[]>()
  for (const entry of entries) {
    const key = monthKey(entry.createdAt)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(entry)
  }
  return Array.from(map.entries()).map(([key, entries]) => ({
    label: monthLabel(key),
    key,
    entries,
  }))
}

@customElement('proto-gallery')
export class ProtoGallery extends LitElement {
  static styles = [
    pageHeaderStyles,
    css`
    :host {
      display: block;
    }

    .notice {
      padding: var(--jh-dimension-300, 1.5rem) var(--jh-dimension-600, 3rem) 0;
      max-width: 800px;
    }

    .count {
      margin: 0 0 var(--jh-dimension-300, 1.5rem);
      font-size: var(--jh-font-size-100, 0.875rem);
      color: var(--jh-color-content-secondary-enabled, #666);
    }

    main {
      padding: var(--jh-dimension-400, 2rem) var(--jh-dimension-600, 3rem) var(--jh-dimension-600, 3rem);
      max-width: 800px;
    }

    jh-list-group {
      display: block;
      margin-bottom: var(--jh-dimension-600, 3rem);
    }

    jh-list-item {
      cursor: pointer;
      padding-bottom: var(--jh-dimension-400);
    }

    .item-right {
      display: flex;
      align-items: center;
      gap: var(--jh-dimension-200, 1rem);
      --jh-icon-color-fill: var(--jh-color-content-secondary-enabled);
    }

    .empty {
      padding: var(--jh-dimension-1200, 6rem) 0;
      color: var(--jh-color-content-secondary-enabled, #666);
    }

    .empty h2 {
      font-size: var(--jh-font-size-400, 1.25rem);
      margin: 0 0 var(--jh-dimension-200, 1rem);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled);
    }

    dialog {
      border: none;
      border-radius: var(--jh-border-radius-300, 12px);
      padding: var(--jh-dimension-600, 3rem);
      width: min(92vw, 460px);
      background: var(--jh-color-container-primary-enabled);
      color: var(--jh-color-content-primary-enabled);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
    }

    dialog::backdrop {
      background: rgba(0, 0, 0, 0.5);
    }

    .dialog-title {
      margin: 0 0 var(--jh-dimension-400, 2rem);
      font-size: var(--jh-font-size-500, 1.5rem);
      font-weight: var(--jh-font-weight-semibold, 600);
    }

    .field {
      display: block;
      margin-bottom: var(--jh-dimension-400, 2rem);
    }

    .field jh-input,
    .field jh-input-url,
    .field jh-input-textarea {
      display: block;
      width: 100%;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--jh-dimension-200, 1rem);
      margin-top: var(--jh-dimension-500, 2.5rem);
    }
  `,
  ]

  @state() private _search = ''
  @state() private _copied = false
  @state() private _actionOutcome: 'opened' | 'copied' = 'copied'
  @state() private _external: ExternalEntry[] = EXTERNAL_LINKS
  @state() private _fUrl = ''
  @state() private _fTitle = ''
  @state() private _fDesigner = ''
  @state() private _fDesc = ''
  @state() private _savingLink = false
  @state() private _linkError = ''
  @state() private _removeError = ''

  private _all = loadPrototypes()
  private _dialogRef = createRef<HTMLDialogElement>()

  private async _copyNewPrototype() {
    try {
      this._actionOutcome = await runAiPrompt(NEW_PROTOTYPE_PROMPT)
      this._copied = true
      setTimeout(() => { this._copied = false }, 4000)
    } catch {
      this._copied = false
    }
  }

  private get _items(): GalleryItem[] {
    const local: GalleryItem[] = this._all.map(p => ({
      kind: 'local',
      title: p.title,
      description: p.description,
      designer: p.designer,
      createdAt: p.createdAt,
      tags: p.tags,
      href: `#/prototypes/${p.designer}/${p.name}`,
    }))
    const external: GalleryItem[] = this._external.map(e => ({
      kind: 'external',
      title: e.title,
      description: e.description,
      designer: e.designer,
      createdAt: e.createdAt,
      tags: [],
      id: e.id,
      url: e.url,
    }))
    return [...local, ...external].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  private get _filtered(): GalleryItem[] {
    const q = this._search.toLowerCase()
    const items = this._items
    if (!q) return items
    return items.filter(
      p =>
        p.title.toLowerCase().includes(q) ||
        p.designer.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
    )
  }

  private _open(item: GalleryItem) {
    if (item.kind === 'external' && item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer')
    } else if (item.href) {
      window.location.hash = item.href
    }
  }

  private async _openDialog() {
    await designerProfileReady
    this._fUrl = ''
    this._fTitle = ''
    this._fDesigner = getDesignerName() ?? ''
    this._fDesc = ''
    this._linkError = ''
    this._savingLink = false
    const dialog = this._dialogRef.value
    dialog
      ?.querySelectorAll('jh-input:not(.designer-field-input), jh-input-url, jh-input-textarea')
      .forEach(el => { (el as HTMLInputElement).value = '' })
    dialog?.showModal()
  }

  private _closeDialog() {
    this._dialogRef.value?.close()
  }

  private async _createExternal() {
    let url = this._fUrl.trim()
    if (!url) return
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`
    try {
      new URL(url)
    } catch {
      this._linkError = 'Enter a valid URL.'
      return
    }

    this._savingLink = true
    this._linkError = ''
    try {
      const entry = await addExternalLink({
        url,
        title: this._fTitle.trim(),
        designer: this._fDesigner.trim(),
        description: this._fDesc.trim(),
      })
      this._external = [...this._external, entry]
      this._closeDialog()
    } catch (err) {
      this._linkError = err instanceof Error ? err.message : 'Failed to save the link.'
    } finally {
      this._savingLink = false
    }
  }

  private async _removeExternal(id: string, e: Event) {
    e.stopPropagation()
    this._removeError = ''
    const previous = this._external
    this._external = this._external.filter(x => x.id !== id)
    try {
      await removeExternalLink(id)
    } catch (err) {
      this._external = previous
      this._removeError = err instanceof Error ? err.message : 'Failed to remove the link.'
    }
  }

  render() {
    const protos = this._filtered
    const groups = groupByMonth(protos)

    return html`
      <div class="page-header">
        <div class="page-header-text">
          <h1 class="page-title">Prototypes</h1>
          <p class="page-subtitle">
            Interactive prototypes built by the JH design team with JH components.
          </p>
        </div>
        <div class="page-header-actions">
          <jh-input-search
            class="page-header-search"
            size="small"
            accessible-label="Search prototypes"
            placeholder="Search by name, designer, or tag..."
            @jh-input=${(e: CustomEvent) => { this._search = (e.target as HTMLInputElement).value }}
          ></jh-input-search>
          <jh-button
            appearance="secondary"
            size="small"
            label="Link external"
            @click=${this._openDialog}
          ></jh-button>
          <jh-button
            appearance="primary"
            size="small"
            label=${this._copied
              ? (this._actionOutcome === 'opened' ? 'Opened!' : 'Command copied!')
              : 'New prototype'}
            @click=${this._copyNewPrototype}
          ></jh-button>
        </div>
      </div>

      ${this._copied ? html`
        <div class="notice">
          <jh-notification type="alert" appearance="positive">
            ${this._actionOutcome === 'opened'
              ? 'Opened your AI tool with the command ready — press Enter to run it. (Also copied to your clipboard as a backup.)'
              : 'Command copied — paste it into Claude Code or Cursor to start a new prototype.'}
          </jh-notification>
        </div>
      ` : ''}

      ${this._removeError ? html`
        <div class="notice">
          <jh-notification type="alert" appearance="negative">${this._removeError}</jh-notification>
        </div>
      ` : ''}

      <main>
        ${protos.length > 0 ? html`
          <p class="count">
            ${this._search
              ? `Showing ${protos.length} of ${this._items.length} prototype${this._items.length !== 1 ? 's' : ''}`
              : `${this._items.length} prototype${this._items.length !== 1 ? 's' : ''}`}
          </p>
        ` : ''}
        ${protos.length === 0 && this._search ? html`
          <div class="empty">
            <h2>No results for "${this._search}"</h2>
          </div>
        ` : protos.length === 0 ? html`
          <div class="empty">
            <h2>No prototypes yet</h2>
            <p>Use <strong>New prototype</strong> to scaffold one in Claude Code or Cursor, or <strong>Link external</strong> to add a link.</p>
          </div>
        ` : groups.map(group => html`
          <jh-list-group label=${group.label}>
            ${group.entries.map(p => html`
              <jh-list-item
                primary-text=${p.title}
                secondary-text=${p.description}
                primary-metadata=${p.designer}
                tabindex="0"
                @click=${() => this._open(p)}
                @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && this._open(p)}
              >
                ${p.kind === 'external' ? html`
                  <div class="item-right" slot="jh-list-item-right">
                    <jh-button
                      appearance="tertiary"
                      size="x-small"
                      label="Remove"
                      @click=${(e: Event) => this._removeExternal(p.id!, e)}
                    ></jh-button>
                    <jh-icon-arrow-up-right-from-square size="small"></jh-icon-arrow-up-right-from-square>
                  </div>
                ` : ''}
              </jh-list-item>
            `)}
          </jh-list-group>
        `)}
      </main>

      <dialog ${ref(this._dialogRef)} @cancel=${this._closeDialog}>
        <h2 class="dialog-title">Link External Prototype</h2>

        ${this._linkError ? html`
          <div class="field">
            <jh-notification type="alert" appearance="negative">${this._linkError}</jh-notification>
          </div>
        ` : ''}

        <div class="field">
          <jh-input-url
            label="URL"
            required
            helper-text="e.g. a Figma prototype or v0 link"
            @jh-input=${(e: CustomEvent) => { this._fUrl = (e.target as HTMLInputElement).value }}
            @jh-change=${(e: CustomEvent) => { this._fUrl = (e.target as HTMLInputElement).value }}
          ></jh-input-url>
        </div>

        <div class="field">
          <jh-input
            label="Title"
            @jh-input=${(e: CustomEvent) => { this._fTitle = (e.target as HTMLInputElement).value }}
            @jh-change=${(e: CustomEvent) => { this._fTitle = (e.target as HTMLInputElement).value }}
          ></jh-input>
        </div>

        <div class="field">
          <jh-input
            class="designer-field-input"
            label="Your name"
            .value=${this._fDesigner}
            @jh-input=${(e: CustomEvent) => { this._fDesigner = (e.target as HTMLInputElement).value }}
            @jh-change=${(e: CustomEvent) => { this._fDesigner = (e.target as HTMLInputElement).value }}
          ></jh-input>
        </div>

        <div class="field">
          <jh-input-textarea
            label="Description"
            rows="3"
            @jh-input=${(e: CustomEvent) => { this._fDesc = (e.target as HTMLInputElement).value }}
            @jh-change=${(e: CustomEvent) => { this._fDesc = (e.target as HTMLInputElement).value }}
          ></jh-input-textarea>
        </div>

        <div class="dialog-actions">
          <jh-button appearance="secondary" label="Cancel" ?disabled=${this._savingLink} @click=${this._closeDialog}></jh-button>
          <jh-button
            appearance="primary"
            label="Create"
            ?disabled=${!this._fUrl.trim()}
            ?pending=${this._savingLink}
            @click=${this._createExternal}
          ></jh-button>
        </div>
      </dialog>
    `
  }
}
