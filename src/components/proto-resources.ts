import { LitElement, html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import '@jack-henry/jh-elements/components/list-group/list-group.js'
import '@jack-henry/jh-elements/components/list-item/list-item.js'
import '@jack-henry/jh-icons/icons-wc/icon-arrow-up-right-from-square.js'
import { RESOURCES, type Resource } from '../data/resources.js'

@customElement('proto-resources')
export class ProtoResources extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .container {
      padding: var(--jh-dimension-600, 3rem);
      max-width: 640px;
    }
  `

  private _open(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  render() {
    return html`
      <div class="container">
        <jh-list-group label="Links">
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
    `
  }
}
