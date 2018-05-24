import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
//import '../node_modules/paho-mqtt/paho-mqtt.js';

/**
 * @customElement
 * @polymer
 */
class VisionWebsocket extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <h2>Hello !</h2>
    `;
  }
  static get is() {
    return 'vision-websocket';
  }
  static get properties() {
    return {
      auto: {
        type: Boolean,
        value: false
      },
      
      wsBroker: {
        type: String,
        value: location.hostname,
        notify: true
      },
      wsPort: {
        type: Number,
        value: (location.protocol == "https:") ? 443 : 15675,
        notify: true
      },
  
      wsUsername: {
        type: String,
        value: 'vision',
        notify: true
      },
      wsPassword: {
        type: String,
        value: 'vision',
        notify: true
      },
      message: {
        type: String,
        notify: true
      },
      response: {
        type: Object,
        notify: true
      },
      currentState: {
        type: Boolean,
        value: true,
        notify: true
      },
      timeout: {
        type: Number,
        value: 20,
        notify: true
      },
      subscribeTo: {
        type: String,
        value: "/ui/camera",
        notify: true
      },
      subscribeFrom: {
        type: String,
        value: "/camera/ui",
        notify: true
      },
      client: {
        type: Object,
        value: function () {
          return new Paho.MQTT.Client(this.wsBroker, this.wsPort, "/ws", "myclientid_" + parseInt(Math.random() * 100, 10));
        }
      }
    };
  }
  connectedCallback() {
    if (this.auto) {
      this._createWebSocket();
    } 
  }

  disconnectedCallback() {
  console.log("CONNECTION CLOSED");
   this._destroyWebSocket();
  }
  _sendMessage(message) {
    var message = new Paho.MQTT.Message(JSON.stringify(message));
    message.destinationName = this.subscribeTo;
    this.client.send(message);
  }
  _sendConnectionOption(context) {
    var options = {
      timeout: context.timeout,
      onSuccess: function () {
        console.log("CONNECTION SUCCESS");
        context.client.subscribe(context.subscribeFrom, { qos: 1 });
      },
      onFailure: function (message) {
        console.log("CONNECTION FAILURE - " + message.errorMessage);
      },
      userName: this.wsUsername,
      password: this.wsPassword,
      useSSL: (location.protocol == "https:")
    }
    return options;
  };
  _createWebSocket() {
    var context = this;
    this.client.onConnectionLost = function (responseObject) {
      console.log("CONNECTION LOST - " + responseObject.errorMessage);
      context.currentState = false;
    };
    this.client.onMessageArrived = function (message) {
      context.response = message;
    };
    console.log("CONNECT TO " + this.wsBroker + ":" + this.wsPort);
    this.client.connect(this._sendConnectionOption(this));
  }
  _destroyWebSocket()
  {
    this.client.disconnect();
  }
}

window.customElements.define(VisionWebsocket.is, VisionWebsocket);
