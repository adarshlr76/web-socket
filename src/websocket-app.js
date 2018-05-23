import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
//import '../node_modules/paho-mqtt/paho-mqtt.js';

/**
 * @customElement
 * @polymer
 */
class WebsocketApp extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <h2>Hello [[prop1]]!</h2>
    `;
  }
  static get properties() {
    return {
      prop1: {
        type: String,
        value: 'websocket-app'
      }
    };
  }
}

window.customElements.define('websocket-app', WebsocketApp);
