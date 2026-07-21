import { LitElement, html, css } from 'lit'
import { state } from 'lit/decorators.js'
import './queue-view.js'
import './detail-view.js'
import { parseRoute, type Route } from './routing.js'

export default class WarningManagementPrototype extends LitElement {
  static styles = css`
    /* height: 100% so the chain reaches wm-detail-view's own :host{height:100%}
       (needed for its jh-platform-content right panel) — a percentage height
       on a child only resolves against a parent whose own height is definite,
       not auto/shrink-to-content, so this link in the chain can't be skipped. */
    :host {
      display: block;
      height: 100%;
    }
  `

  @state() private _route: Route = parseRoute(window.location.hash)

  private _onHashChange = () => {
    this._route = parseRoute(window.location.hash)
  }

  connectedCallback() {
    super.connectedCallback()
    window.addEventListener('hashchange', this._onHashChange)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener('hashchange', this._onHashChange)
  }

  render() {
    return this._route.name === 'detail'
      ? html`<wm-detail-view .warningId=${this._route.id}></wm-detail-view>`
      : html`<wm-queue-view></wm-queue-view>`
  }
}
