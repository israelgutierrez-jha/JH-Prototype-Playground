import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { COMPONENT_DOCS } from '../data/components/index.js'

/** tag → friendly label + summary, for the inspect tooltip. */
const DOC_BY_TAG = new Map(
  COMPONENT_DOCS.map(d => [d.tag, { name: d.name, summary: d.summary }])
)

/** Prettify an undocumented tag, e.g. `jh-icon-house` → "Icon house". */
function prettifyTag(tag: string): string {
  const base = tag.replace(/^jh-/, '').replace(/-/g, ' ')
  return base.charAt(0).toUpperCase() + base.slice(1)
}

/** Only inspect content rendered inside a prototype or template viewer. */
function inScope(path: EventTarget[]): boolean {
  return path.some(
    n =>
      n instanceof Element &&
      (n.tagName === 'PROTO-SHELL' || n.tagName === 'PROTO-TEMPLATE-SHELL')
  )
}

/**
 * "Dev mode" overlay. When `active`, hovering anywhere inside a prototype or
 * template highlights the JH custom element under the cursor and shows a tooltip
 * naming it — so people less familiar with the library can see what's in use.
 *
 * Uses `composedPath()` (which pierces shadow DOM) to find the most specific
 * `jh-*` element under the pointer. Renders a fixed, click-through overlay, so
 * the prototype stays fully interactive while inspecting.
 */
@customElement('proto-inspector')
export class ProtoInspector extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      inset: 0;
      z-index: 2000;
      pointer-events: none;
    }

    .box {
      position: fixed;
      border: 2px solid var(--jh-color-content-brand-enabled, #2f6fed);
      border-radius: var(--jh-border-radius-100, 4px);
      background: color-mix(in srgb, var(--jh-color-content-brand-enabled, #2f6fed) 12%, transparent);
      transition: top 60ms ease, left 60ms ease, width 60ms ease, height 60ms ease;
    }

    .tip {
      position: fixed;
      max-width: 280px;
      padding: var(--jh-dimension-200, 0.5rem) var(--jh-dimension-300, 0.75rem);
      border-radius: var(--jh-border-radius-200, 8px);
      background: var(--jh-color-content-brand-enabled, #2f6fed);
      color: #fff;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
      line-height: 1.4;
    }

    .tip-name {
      font-weight: var(--jh-font-weight-semibold, 600);
      font-size: var(--jh-font-size-200, 1rem);
    }

    .tip-tag {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: var(--jh-font-size-100, 0.875rem);
      opacity: 0.85;
    }

    .tip-summary {
      margin-top: 2px;
      font-size: var(--jh-font-size-100, 0.875rem);
      opacity: 0.9;
    }
  `

  @property({ type: Boolean }) active = false

  @state() private _box: { top: number; left: number; width: number; height: number } | null = null
  @state() private _tag = ''
  @state() private _name = ''
  @state() private _summary = ''
  @state() private _x = 0
  @state() private _y = 0

  private _targetEl: Element | null = null
  private _raf = 0

  updated(changed: Map<string, unknown>) {
    if (changed.has('active')) {
      if (this.active) this._attach()
      else this._detach()
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this._detach()
  }

  private _attach() {
    window.addEventListener('pointermove', this._onMove, { capture: true, passive: true })
    window.addEventListener('scroll', this._onScroll, { capture: true, passive: true })
  }

  private _detach() {
    window.removeEventListener('pointermove', this._onMove, { capture: true })
    window.removeEventListener('scroll', this._onScroll, { capture: true })
    cancelAnimationFrame(this._raf)
    this._clear()
  }

  private _clear() {
    this._box = null
    this._targetEl = null
    this._tag = ''
    this._name = ''
    this._summary = ''
  }

  private _onScroll = () => {
    if (this._targetEl?.isConnected) this._measure(this._targetEl)
    else this._clear()
  }

  private _onMove = (e: Event) => {
    const ev = e as PointerEvent
    this._x = ev.clientX
    this._y = ev.clientY
    const path = ev.composedPath()
    if (!inScope(path)) {
      if (this._box) this._clear()
      return
    }
    const el = path.find(
      n => n instanceof Element && n.tagName.startsWith('JH-')
    ) as Element | undefined
    if (!el) {
      if (this._box) this._clear()
      return
    }
    if (el !== this._targetEl) {
      this._targetEl = el
      const tag = el.tagName.toLowerCase()
      this._tag = tag
      const doc = DOC_BY_TAG.get(tag)
      this._name = doc?.name ?? prettifyTag(tag)
      this._summary = doc?.summary ?? ''
    }
    this._raf = requestAnimationFrame(() => el && this._measure(el))
  }

  private _measure(el: Element) {
    const r = el.getBoundingClientRect()
    this._box = { top: r.top, left: r.left, width: r.width, height: r.height }
  }

  render() {
    if (!this.active || !this._box) return html``
    const TIP_W = 280
    const left = this._x + 14 + TIP_W > window.innerWidth ? this._x - 14 - TIP_W : this._x + 14
    const top = Math.min(this._y + 18, window.innerHeight - 90)
    return html`
      <div
        class="box"
        style="top:${this._box.top}px;left:${this._box.left}px;width:${this._box.width}px;height:${this._box.height}px"
      ></div>
      <div class="tip" style="left:${left}px;top:${top}px">
        <div class="tip-name">${this._name}</div>
        <div class="tip-tag">&lt;${this._tag}&gt;</div>
        ${this._summary ? html`<div class="tip-summary">${this._summary}</div>` : ''}
      </div>
    `
  }
}
