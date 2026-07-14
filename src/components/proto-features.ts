import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '@jack-henry/jh-elements/components/card/card.js'
import '@jack-henry/jh-elements/components/tag/tag.js'
import '@jack-henry/jh-elements/components/tag-group/tag-group.js'
import '@jack-henry/jh-elements/components/button/button.js'
import '@jack-henry/jh-elements/components/notification/notification.js'
import '@jack-henry/jh-elements/components/input/input.js'
import '@jack-henry/jh-elements/components/input-textarea/input-textarea.js'
import '@jack-henry/jh-elements/components/menu/menu.js'
import '@jack-henry/jh-elements/components/list-item/list-item.js'
import '@jack-henry/jh-icons/icons-wc/icon-thumbs-up.js'
import '@jack-henry/jh-icons/icons-wc/icon-chevron-left-small.js'
import '@jack-henry/jh-icons/icons-wc/icon-chevron-right-small.js'
import { designerProfileReady, formatDesignerName, getDesignerName } from '../utils/designer-profile.js'
import '@jack-henry/jh-icons/icons-wc/icon-ellipsis.js'
// No jh-elements dialog exists yet; jha-dialog (legacy @banno/jha-wc) is the sanctioned fallback,
// same pattern as jha-advanced-table for gaps in the current design system. It doesn't self-position
// as a modal, so we own the backdrop overlay (see CLAUDE.md's jha-dialog reference).
import '@banno/jha-wc/src/jha-dialog/jha-dialog.js'
import { FEATURE_COLUMNS, FEATURE_CARDS, type FeatureCard, type FeatureColumnId } from '../data/features.js'
import { pageHeaderStyles } from '../styles/page-header.js'

// Grey → blue → yellow → green: unreviewed → scheduled → active → done.
// Each resolves through a theme-aware token (or the hand-assembled
// --proto-kanban-in-progress-bg, since jh-tokens has no warning/yellow
// semantic pair) so the hue itself stays correct in both themes.
const COLUMN_ACCENT: Record<FeatureColumnId, string> = {
  requested: 'var(--jh-color-container-neutral-enabled)',
  planned: 'var(--jh-color-container-brand-enabled)',
  'in-progress': 'var(--proto-kanban-in-progress-bg)',
  shipped: 'var(--jh-color-container-positive-enabled)',
}

// The full-strength accent above is right for a small dot, but is a bold,
// fully-saturated surface color in dark mode — not the "very light" wash we
// want behind a whole card. Blending a slice of it into the card's normal
// background gives a subtle tint in both themes instead of a solid block.
function cardTint(columnId: FeatureColumnId): string {
  return `color-mix(in srgb, ${COLUMN_ACCENT[columnId]} 18%, var(--jh-color-container-primary-enabled))`
}

// The options menu always has the same two items, so its footprint is known
// ahead of render — no need to measure it (and risk a flash of mispositioned
// content) before deciding where it fits.
const MENU_WIDTH = 140
const MENU_HEIGHT_ESTIMATE = 130
const MENU_GAP = 4

/**
 * Anchors the menu below the trigger, right-aligned to it — unless the
 * viewport doesn't have room, in which case it flips above and/or to the
 * right so "Remove" is never rendered off-screen.
 */
function computeMenuPosition(anchor: DOMRect): { top: number; left: number } {
  const fitsBelow = anchor.bottom + MENU_GAP + MENU_HEIGHT_ESTIMATE <= window.innerHeight
  const top = fitsBelow ? anchor.bottom + MENU_GAP : anchor.top - MENU_GAP - MENU_HEIGHT_ESTIMATE

  const rightAligned = anchor.right - MENU_WIDTH
  const left = rightAligned >= MENU_GAP ? rightAligned : anchor.left

  return {
    top: Math.max(MENU_GAP, Math.min(top, window.innerHeight - MENU_GAP - MENU_HEIGHT_ESTIMATE)),
    left: Math.max(MENU_GAP, Math.min(left, window.innerWidth - MENU_GAP - MENU_WIDTH)),
  }
}

/**
 * Feature requests persist through the dev-only `/__proto-api/features`
 * endpoint (see vite.config.ts), which reads/writes the real
 * `src/data/features.json` — same pattern as external links and prototype
 * settings.
 */
async function submitFeatureCard(fields: {
  title: string
  description: string
  submittedBy: string
  tags: string[]
}): Promise<FeatureCard> {
  const res = await fetch('/__proto-api/features', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  })
  const result = await res.json()
  if (!res.ok || !result.ok) throw new Error(result.error || 'Failed to submit feedback.')
  return result.entry
}

async function updateFeatureCard(
  id: string,
  fields: { title: string; description: string; submittedBy: string; assignedTo: string; tags: string[] }
): Promise<FeatureCard> {
  const res = await fetch('/__proto-api/features', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...fields }),
  })
  const result = await res.json()
  if (!res.ok || !result.ok) throw new Error(result.error || 'Failed to save changes.')
  return result.entry
}

async function moveFeatureCard(id: string, column: FeatureColumnId): Promise<FeatureCard> {
  const res = await fetch('/__proto-api/features', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, column }),
  })
  const result = await res.json()
  if (!res.ok || !result.ok) throw new Error(result.error || 'Failed to move the card.')
  return result.entry
}

async function removeFeatureCard(id: string): Promise<void> {
  const res = await fetch('/__proto-api/features', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  })
  const result = await res.json()
  if (!res.ok || !result.ok) throw new Error(result.error || 'Failed to remove the card.')
}

async function voteFeatureCard(id: string): Promise<FeatureCard> {
  const res = await fetch('/__proto-api/features', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, incrementVotes: true }),
  })
  const result = await res.json()
  if (!res.ok || !result.ok) throw new Error(result.error || 'Failed to record your vote.')
  return result.entry
}

// Soft, per-browser dedup — there's no auth here, so this only discourages
// accidental double-votes (clearing storage or using another browser bypasses
// it), not a hard limit.
const VOTED_STORAGE_KEY = 'jh-feature-voted-ids'

function loadVotedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(VOTED_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch {
    return new Set()
  }
}

function saveVotedIds(ids: Set<string>) {
  localStorage.setItem(VOTED_STORAGE_KEY, JSON.stringify([...ids]))
}

@customElement('proto-features')
export class ProtoFeatures extends LitElement {
  static styles = [
    pageHeaderStyles,
    css`
    :host {
      display: block;
    }

    .page-body {
      padding: var(--jh-dimension-500, 2.5rem) var(--jh-dimension-600, 3rem) var(--jh-dimension-600, 3rem);
    }

    .notice {
      margin-bottom: var(--jh-dimension-400, 1rem);
    }

    .board {
      display: flex;
      align-items: flex-start;
      gap: var(--jh-dimension-500, 2rem);
      overflow-x: auto;
      padding-bottom: var(--jh-dimension-300, 1rem);
    }

    .column {
      flex: 0 0 300px;
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-300, 1rem);
    }

    .column-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--jh-dimension-100, 0.25rem);
    }

    .column-title-group {
      display: flex;
      align-items: center;
      gap: var(--jh-dimension-200, 0.5rem);
    }

    .column-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .column-title {
      font-size: var(--jh-font-size-400, 1rem);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled);
    }

    .column-count {
      font-size: var(--jh-font-size-300, 0.75rem);
      color: var(--jh-color-content-secondary-enabled);
      background: var(--jh-color-container-primary-enabled);
      border: 1px solid var(--jh-color-divider-primary);
      border-radius: var(--jh-border-radius-200, 999px);
      padding: 2px var(--jh-dimension-200, 0.5rem);
    }

    .cards {
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-300, 1rem);
      min-height: 40px;
    }

    .card-inner {
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-200, 0.5rem);
      padding: var(--jh-dimension-300, 1rem);
    }

    .card-title {
      font-size: var(--jh-font-size-400, 1rem);
      font-weight: var(--jh-font-weight-semibold, 600);
      color: var(--jh-color-content-primary-enabled);
      margin: 0;
    }

    .card-description {
      font-size: var(--jh-font-size-350, 0.875rem);
      color: var(--jh-color-content-secondary-enabled);
      line-height: 1.5;
      margin: 0;
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--jh-dimension-200, 0.5rem);
      margin-top: var(--jh-dimension-100, 0.25rem);
    }

    .submitted-by {
      font-size: var(--jh-font-size-300, 0.75rem);
      color: var(--jh-color-content-secondary-enabled);
    }

    .assigned-to {
      font-size: var(--jh-font-size-300, 0.75rem);
      color: var(--jh-color-content-brand-enabled);
      margin: 0;
    }

    .votes {
      flex-shrink: 0;
    }

    .card-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: var(--jh-dimension-200, 0.5rem);
      border-top: 1px solid var(--jh-color-divider-primary);
    }

    .move-buttons {
      display: flex;
      gap: var(--jh-dimension-100, 0.25rem);
    }

    /*
     * jh-card clips overflow (rounded corners), so the options menu can't
     * live inside it as an absolutely-positioned child — it renders as a
     * single fixed-position overlay instead, positioned from the trigger
     * button's screen coordinates (see _menuPosition / computeMenuPosition).
     */
    .card-menu {
      position: fixed;
      min-width: 140px;
      z-index: var(--jh-z-index-positive-1000, 1000);
    }

    .dialog-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: var(--jh-z-index-positive-1000, 1000);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--jh-dimension-400, 1rem);
    }

    jha-dialog {
      --jha-dialog-width: 460px;
    }

    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: var(--jh-dimension-100, 0.5rem);
    }

    .field {
      display: block;
      margin-bottom: var(--jh-dimension-400, 2rem);
    }

    .field jh-input,
    .field jh-input-textarea {
      display: block;
      width: 100%;
    }

    footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--jh-dimension-200, 1rem);
      margin-top: var(--jh-dimension-300, 1.5rem);
    }
  `,
  ]

  @state() private _cards: FeatureCard[] = FEATURE_CARDS
  @state() private _pageError = ''
  @state() private _votedIds: Set<string> = loadVotedIds()

  // The id of the card whose options menu is open, or null if none is, plus
  // its resolved screen position (see computeMenuPosition) so the menu
  // (rendered outside the clipped jh-card) can anchor to its trigger.
  @state() private _openMenuId: string | null = null
  @state() private _menuPosition: { top: number; left: number } | null = null

  // null while creating a new card; the card's id while editing an existing one.
  @state() private _editingId: string | null = null
  @state() private _dialogOpen = false
  @state() private _fTitle = ''
  @state() private _fDescription = ''
  @state() private _fSubmittedBy = ''
  @state() private _fAssignedTo = ''
  @state() private _fTags = ''
  @state() private _saving = false
  @state() private _formError = ''

  private _closeMenu = () => {
    this._openMenuId = null
    this._menuPosition = null
  }

  private _onWindowClick = () => {
    if (this._openMenuId) this._closeMenu()
  }

  private _onWindowKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (this._openMenuId) this._closeMenu()
      if (this._dialogOpen) this._closeDialog()
    }
  }

  // Scroll events don't bubble, so a capture-phase listener on window is the
  // only way to hear about scrolling inside the board or the page and close
  // the menu rather than leave it misaligned with its trigger.
  private _onWindowScroll = () => {
    if (this._openMenuId) this._closeMenu()
  }

  connectedCallback() {
    super.connectedCallback()
    window.addEventListener('click', this._onWindowClick)
    window.addEventListener('keydown', this._onWindowKeydown)
    window.addEventListener('scroll', this._onWindowScroll, true)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener('click', this._onWindowClick)
    window.removeEventListener('keydown', this._onWindowKeydown)
    window.removeEventListener('scroll', this._onWindowScroll, true)
  }

  private _cardsFor(columnId: FeatureColumnId): FeatureCard[] {
    return this._cards.filter(c => c.column === columnId)
  }

  private _toggleMenu(id: string, e: Event) {
    e.stopPropagation()
    if (this._openMenuId === id) {
      this._closeMenu()
      return
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    this._menuPosition = computeMenuPosition(rect)
    this._openMenuId = id
  }

  private _editFromMenu(card: FeatureCard) {
    this._closeMenu()
    this._openEditDialog(card)
  }

  private _removeFromMenu(id: string) {
    this._closeMenu()
    this._removeCard(id)
  }

  private async _openCreateDialog() {
    await designerProfileReady
    this._editingId = null
    this._fTitle = ''
    this._fDescription = ''
    this._fSubmittedBy = getDesignerName() ?? ''
    this._fAssignedTo = ''
    this._fTags = ''
    this._formError = ''
    this._saving = false
    this._dialogOpen = true
  }

  private _openEditDialog(card: FeatureCard) {
    this._editingId = card.id
    this._fTitle = card.title
    this._fDescription = card.description
    this._fSubmittedBy = card.submittedBy
    this._fAssignedTo = card.assignedTo
    this._fTags = card.tags.join(', ')
    this._formError = ''
    this._saving = false
    this._dialogOpen = true
  }

  private _closeDialog() {
    this._dialogOpen = false
  }

  private async _saveDialog() {
    const title = this._fTitle.trim()
    if (!title) {
      this._formError = 'Title cannot be empty.'
      return
    }

    this._saving = true
    this._formError = ''
    try {
      const tags = this._fTags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)
      const description = this._fDescription.trim()
      const submittedBy = this._fSubmittedBy.trim()

      if (this._editingId) {
        // Who's picking it up is only ever set from Edit, never at submission
        // time — nobody should be able to assign their own new idea.
        const entry = await updateFeatureCard(this._editingId, {
          title,
          description,
          submittedBy,
          tags,
          assignedTo: this._fAssignedTo.trim(),
        })
        this._cards = this._cards.map(c => (c.id === entry.id ? entry : c))
      } else {
        const entry = await submitFeatureCard({ title, description, submittedBy, tags })
        this._cards = [...this._cards, entry]
      }
      this._closeDialog()
    } catch (err) {
      this._formError = err instanceof Error ? err.message : 'Failed to save.'
    } finally {
      this._saving = false
    }
  }

  private async _moveCard(card: FeatureCard, direction: -1 | 1) {
    const idx = FEATURE_COLUMNS.findIndex(c => c.id === card.column)
    const nextIdx = idx + direction
    if (nextIdx < 0 || nextIdx >= FEATURE_COLUMNS.length) return
    const nextColumn = FEATURE_COLUMNS[nextIdx].id

    this._pageError = ''
    const previous = this._cards
    this._cards = this._cards.map(c => (c.id === card.id ? { ...c, column: nextColumn } : c))
    try {
      await moveFeatureCard(card.id, nextColumn)
    } catch (err) {
      this._cards = previous
      this._pageError = err instanceof Error ? err.message : 'Failed to move the card.'
    }
  }

  private async _removeCard(id: string) {
    this._pageError = ''
    const previous = this._cards
    this._cards = this._cards.filter(c => c.id !== id)
    try {
      await removeFeatureCard(id)
    } catch (err) {
      this._cards = previous
      this._pageError = err instanceof Error ? err.message : 'Failed to remove the card.'
    }
  }

  private async _vote(card: FeatureCard) {
    if (this._votedIds.has(card.id)) return

    this._pageError = ''
    const previousCards = this._cards
    const previousVoted = this._votedIds
    this._cards = this._cards.map(c => (c.id === card.id ? { ...c, votes: c.votes + 1 } : c))
    this._votedIds = new Set(this._votedIds).add(card.id)
    saveVotedIds(this._votedIds)

    try {
      const entry = await voteFeatureCard(card.id)
      this._cards = this._cards.map(c => (c.id === entry.id ? entry : c))
    } catch (err) {
      this._cards = previousCards
      this._votedIds = previousVoted
      saveVotedIds(this._votedIds)
      this._pageError = err instanceof Error ? err.message : 'Failed to record your vote.'
    }
  }

  render() {
    return html`
      <div class="page-header">
        <div class="page-header-text">
          <h1 class="page-title">Features</h1>
          <p class="page-subtitle">
            Track feature requests and feedback from the design team. Submit an idea, and move cards across
            the board as they get picked up.
          </p>
        </div>
        <div class="page-header-actions">
          <jh-button appearance="primary" label="Submit feedback" @click=${this._openCreateDialog}></jh-button>
        </div>
      </div>
      <div class="page-body">
        ${this._pageError ? html`
          <jh-notification class="notice" type="alert" appearance="negative">${this._pageError}</jh-notification>
        ` : ''}

        <div class="board">
          ${FEATURE_COLUMNS.map((column, columnIndex) => {
            const cards = this._cardsFor(column.id)
            return html`
              <div class="column">
                <div class="column-header">
                  <div class="column-title-group">
                    <span class="column-dot" style="background: ${COLUMN_ACCENT[column.id]}"></span>
                    <span class="column-title">${column.label}</span>
                  </div>
                  <span class="column-count">${cards.length}</span>
                </div>
                <div class="cards">
                  ${cards.map(card => html`
                    <jh-card style="--jh-card-color-background: ${cardTint(column.id)}">
                      <div class="card-inner">
                        <p class="card-title">${card.title}</p>
                        ${card.description ? html`<p class="card-description">${card.description}</p>` : ''}
                        ${card.tags.length ? html`
                          <jh-tag-group>
                            ${card.tags.map(tag => html`<jh-tag label=${tag}></jh-tag>`)}
                          </jh-tag-group>
                        ` : ''}
                        ${card.assignedTo ? html`<p class="assigned-to">Assigned to ${card.assignedTo}</p>` : ''}
                        <div class="card-footer">
                          <span class="submitted-by">by ${formatDesignerName(card.submittedBy)}</span>
                          <jh-button
                            class="votes"
                            appearance="tertiary"
                            size="x-small"
                            label="${card.votes}"
                            accessible-label=${this._votedIds.has(card.id) ? 'You upvoted this' : 'Upvote this feature request'}
                            ?disabled=${this._votedIds.has(card.id)}
                            @click=${() => this._vote(card)}
                          >
                            <jh-icon-thumbs-up slot="jh-button-icon-left" size="x-small"></jh-icon-thumbs-up>
                          </jh-button>
                        </div>
                        <div class="card-actions">
                          <div class="move-buttons">
                            <jh-button
                              appearance="tertiary"
                              size="x-small"
                              accessible-label="Move to ${FEATURE_COLUMNS[columnIndex - 1]?.label ?? ''}"
                              ?disabled=${columnIndex === 0}
                              @click=${() => this._moveCard(card, -1)}
                            >
                              <jh-icon-chevron-left-small slot="jh-button-icon-left" size="small"></jh-icon-chevron-left-small>
                            </jh-button>
                            <jh-button
                              appearance="tertiary"
                              size="x-small"
                              accessible-label="Move to ${FEATURE_COLUMNS[columnIndex + 1]?.label ?? ''}"
                              ?disabled=${columnIndex === FEATURE_COLUMNS.length - 1}
                              @click=${() => this._moveCard(card, 1)}
                            >
                              <jh-icon-chevron-right-small slot="jh-button-icon-left" size="small"></jh-icon-chevron-right-small>
                            </jh-button>
                          </div>
                          <jh-button
                            appearance="tertiary"
                            size="x-small"
                            accessible-label="More actions"
                            @click=${(e: Event) => this._toggleMenu(card.id, e)}
                          >
                            <jh-icon-ellipsis slot="jh-button-icon-left" size="small"></jh-icon-ellipsis>
                          </jh-button>
                        </div>
                      </div>
                    </jh-card>
                  `)}
                </div>
              </div>
            `
          })}
        </div>
      </div>

      ${this._openMenuId && this._menuPosition ? (() => {
        const card = this._cards.find(c => c.id === this._openMenuId)
        if (!card) return ''
        const { top, left } = this._menuPosition
        return html`
          <jh-menu
            class="card-menu"
            style="top: ${top}px; left: ${left}px; height: auto;"
          >
            <jh-list-item
              primary-text="Edit"
              tabindex="0"
              @click=${() => this._editFromMenu(card)}
              @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && this._editFromMenu(card)}
            ></jh-list-item>
            <jh-list-item
              primary-text="Remove"
              tabindex="0"
              @click=${() => this._removeFromMenu(card.id)}
              @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && this._removeFromMenu(card.id)}
            ></jh-list-item>
          </jh-menu>
        `
      })() : ''}

      ${this._dialogOpen ? html`
        <div class="dialog-overlay">
          <jha-dialog
            .heading=${this._editingId ? 'Edit Feedback' : 'Submit Feedback'}
            confirm-label=""
            hide-confirm
            @cancel=${this._closeDialog}
          >
            <div slot="dialog-content" class="dialog-content">
              ${this._formError ? html`
                <div class="field">
                  <jh-notification type="alert" appearance="negative">${this._formError}</jh-notification>
                </div>
              ` : ''}

              <div class="field">
                <jh-input
                  label="Title"
                  required
                  .value=${this._fTitle}
                  @jh-input=${(e: CustomEvent) => { this._fTitle = (e.target as HTMLInputElement).value }}
                  @jh-change=${(e: CustomEvent) => { this._fTitle = (e.target as HTMLInputElement).value }}
                ></jh-input>
              </div>

              <div class="field">
                <jh-input-textarea
                  label="Description"
                  rows="3"
                  .value=${this._fDescription}
                  @jh-input=${(e: CustomEvent) => { this._fDescription = (e.target as HTMLInputElement).value }}
                  @jh-change=${(e: CustomEvent) => { this._fDescription = (e.target as HTMLInputElement).value }}
                ></jh-input-textarea>
              </div>

              <div class="field">
                <jh-input
                  label="Suggested by"
                  helper-text="Who's asking for this"
                  .value=${this._fSubmittedBy}
                  @jh-input=${(e: CustomEvent) => { this._fSubmittedBy = (e.target as HTMLInputElement).value }}
                  @jh-change=${(e: CustomEvent) => { this._fSubmittedBy = (e.target as HTMLInputElement).value }}
                ></jh-input>
              </div>

              ${this._editingId ? html`
                <div class="field">
                  <jh-input
                    label="Assigned to"
                    helper-text="Add your name here if you're picking this up"
                    .value=${this._fAssignedTo}
                    @jh-input=${(e: CustomEvent) => { this._fAssignedTo = (e.target as HTMLInputElement).value }}
                    @jh-change=${(e: CustomEvent) => { this._fAssignedTo = (e.target as HTMLInputElement).value }}
                  ></jh-input>
                </div>
              ` : ''}

              <div class="field">
                <jh-input
                  label="Tags"
                  helper-text="Comma-separated, e.g. workflow, docs"
                  .value=${this._fTags}
                  @jh-input=${(e: CustomEvent) => { this._fTags = (e.target as HTMLInputElement).value }}
                  @jh-change=${(e: CustomEvent) => { this._fTags = (e.target as HTMLInputElement).value }}
                ></jh-input>
              </div>

              <footer>
                <jh-button appearance="secondary" label="Cancel" ?disabled=${this._saving} @click=${this._closeDialog}></jh-button>
                <jh-button
                  appearance="primary"
                  label=${this._editingId ? 'Save' : 'Submit'}
                  ?disabled=${!this._fTitle.trim()}
                  ?pending=${this._saving}
                  @click=${this._saveDialog}
                ></jh-button>
              </footer>
            </div>
          </jha-dialog>
        </div>
      ` : ''}
    `
  }
}
