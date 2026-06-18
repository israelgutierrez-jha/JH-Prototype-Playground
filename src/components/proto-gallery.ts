import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import type { PrototypeMeta } from './proto-card.js'
import '@jack-henry/jh-elements/components/input-search/input-search.js'
import '@jack-henry/jh-elements/components/list-group/list-group.js'
import '@jack-henry/jh-elements/components/list-item/list-item.js'

interface PrototypeEntry extends PrototypeMeta {
  designer: string
  name: string
}

interface MonthGroup {
  label: string
  key: string
  entries: PrototypeEntry[]
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

function groupByMonth(entries: PrototypeEntry[]): MonthGroup[] {
  const map = new Map<string, PrototypeEntry[]>()
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
  static styles = css`
    :host {
      display: block;
    }

    .toolbar {
      padding: var(--jh-dimension-400, 2rem) var(--jh-dimension-600, 3rem) 0;
      display: flex;
      align-items: center;
      gap: var(--jh-dimension-400, 2rem);
    }

    .toolbar jh-input-search {
      flex: 1;
      max-width: 420px;
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
  `

  @state() private _search = ''
  private _all = loadPrototypes()

  private get _filtered() {
    const q = this._search.toLowerCase()
    if (!q) return this._all
    return this._all.filter(
      p =>
        p.title.toLowerCase().includes(q) ||
        p.designer.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
    )
  }

  private _navigate(p: PrototypeEntry) {
    window.location.hash = '#/prototypes/' + p.designer + '/' + p.name
  }

  render() {
    const protos = this._filtered
    const groups = groupByMonth(protos)

    return html`
      <div class="toolbar">
        <jh-input-search
          label="Search prototypes"
          placeholder="Search by name, designer, or tag..."
          @jh-input=${(e: CustomEvent) => { this._search = (e.target as HTMLInputElement).value }}
        ></jh-input-search>
      </div>

      <main>
        ${protos.length > 0 ? html`
          <p class="count">
            ${this._search
              ? `Showing ${protos.length} of ${this._all.length} prototype${this._all.length !== 1 ? 's' : ''}`
              : `${this._all.length} prototype${this._all.length !== 1 ? 's' : ''}`}
          </p>
        ` : ''}
        ${protos.length === 0 && this._search ? html`
          <div class="empty">
            <h2>No results for "${this._search}"</h2>
          </div>
        ` : protos.length === 0 ? html`
          <div class="empty">
            <h2>No prototypes yet</h2>
            <p>Run <code>/new-prototype</code> in Claude Code to create your first one.</p>
          </div>
        ` : groups.map(group => html`
          <jh-list-group label=${group.label}>
            ${group.entries.map(p => html`
              <jh-list-item
                primary-text=${p.title}
                secondary-text=${p.description}
                primary-metadata=${p.designer}
                tabindex="0"
                @click=${() => this._navigate(p)}
                @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && this._navigate(p)}
              ></jh-list-item>
            `)}
          </jh-list-group>
        `)}
      </main>
    `
  }
}
