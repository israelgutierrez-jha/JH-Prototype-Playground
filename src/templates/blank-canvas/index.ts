import { LitElement, html, css } from 'lit'

export default class BlankCanvas extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `

  render() {
    return html``
  }
}
