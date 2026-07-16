import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '@jack-henry/jh-elements/components/card/card.js'
import '@jack-henry/jh-elements/components/tag/tag.js'
import '@jack-henry/jh-elements/components/tag-group/tag-group.js'
import '@jack-henry/jh-elements/components/button/button.js'
import { formatDesignerName } from '../utils/designer-profile.js'

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
  /**
   * The designer's real name as typed (e.g. "Israel Gutierrez"), for display
   * only — `designer` above stays the kebab-case folder slug and is what
   * routing/the filesystem depend on. Falls back to a formatted version of
   * `designer` wherever this is missing (see `formatDesignerName` in
   * `src/utils/designer-profile.ts`).
   */
  designerName?: string
  tags: string[]
  createdAt: string
  navItems?: NavItem[]
  /**
   * Opt-in flag for the restricted external (CU-facing) gallery build — see
   * CLAUDE.md's "External / CU-facing gallery" section. Absent or `false`
   * means the prototype is never included in that build (safe default).
   */
  public?: boolean
  /**
   * Hex SHA-256 hash of a password required to view this prototype in the
   * external build (see `src/utils/password-hash.ts`). Never store the
   * plaintext password here.
   */
  passwordHash?: string
  /** URL of the Figma frame/file this prototype was built from, if any. */
  figmaLink?: string
  /**
   * Snapshot of the Figma frame's name, captured by the assistant at the
   * time `figmaLink` was last set (e.g. during `/figma-to-prototype`) — not
   * live-fetched. Purely a nicer label; safe to leave stale/absent.
   */
  figmaFrameName?: string
  /** URL of the related Jira ticket, if any. */
  jiraLink?: string
  /**
   * Snapshot of the Jira ticket's key/summary, captured by the assistant via
   * the Atlassian MCP server at the time `jiraLink` was last set — never
   * live-fetched by the running app (no server credentials exist for that,
   * even once deployed). Editing `jiraLink` from the in-app "Related links"
   * dropdown clears these two fields rather than leaving them stale; ask the
   * assistant to re-set the link to refresh them. Deliberately excludes
   * ticket *status*, which would go stale exactly when it matters most.
   */
  jiraTicketKey?: string
  jiraTicketSummary?: string
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
      font-size: var(--jh-font-size-450, 1.125rem);
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
      line-height: 1.5;
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
  @property() designerName = ''
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
            <span class="designer">by ${formatDesignerName(this.designerName || this.designer)}</span>
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
