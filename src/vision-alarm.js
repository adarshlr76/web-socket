import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import './vision-websocket.js';

//import '../node_modules/paho-mqtt/paho-mqtt.js';

/**
 * @customElement
 * @polymer
 */
class VisionAlarm extends PolymerElement {
  static get template() {
    return html`
    <style>
      :host {
        display: block;
        --show-alarms-list : none;
      }

      .view-root {
        height: 50px;
      }

      .alarms-container {
        position: relative;
        max-height: 400px;
        z-index: 100;
        background-color: #222;
      }

      .alarms-frame {
        display: table;
        width: 100%;
        border-left: solid 0.5px #aaa;
        border-right: solid 0.5px #aaa;
      }

      .alarms-frame-row {
        display: table-row;
        height: 50px;
      }

      .alarms-frame-col {
        display: table-cell;
        vertical-align: middle;
        border-bottom: solid 1px rgba(160, 160, 160, 0.5);
      }

      .alarms-icon {
        text-align: center;
        width: 50px;
      }

      .alarms-title span {
        display: block;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .alarms-ack {
        text-align: center;
        width: 75px;
      }

      .alarms-ack .alarms-ack-btn {
        border: solid 1px #aaa;
        cursor: pointer;
        font-size: 15px;
        padding: 2px 0;
        width: 60px;
      }

      .alarms-ack:hover .alarms-ack-btn {
        border-width: 2px;
      }

      .alarms-dropdown {
        background-color: #333;
        border-top: 1px solid black;
        box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
        position: relative;
        z-index: 1;
      }

      .alarms-frame-row:not(:first-child) {
        display: var(--show-alarms-list);
        /* None */
      }

      .alarms-view-all {
        text-align: center;
        color: white;
        cursor: pointer;
      }
    </style>

    <!-- Mark up -->

    <app-location route="{{route}}" url-space-regex="^[[rootPath]]">
    </app-location>

    <vision-websocket id="vws" auto current-state="{{currentState}}" subscribe-to="/ui/camera" subscribe-from="/camera/ui" response="{{response}}">
    </vision-websocket>
    <vision-websocket id="vws2" auto current-state="{{currentState2}}" subscribe-to="/ui/alarm" subscribe-from="/alarm/ui" response="{{response2}}">
    </vision-websocket>
    
    <button on-click="_sendMessage">Click Camera</button> <br>
    output {{output}} <br>
    <button on-click="_sendMessage2">Click Alarm</button> <br>
    output2 {{output2}}
  
    `;
  }
  static get is() { return 'vision-alarm'; }
  static get properties() {
    return {
      prop1: {
        type: String,
        value: 'vision-alarm'
      },

      response: {
        type: Object,
        notify: true,
        reflectToAttribute: true,
        observer: '_responseChanged',
      },
      response2: {
        type: Object,
        notify: true,
        reflectToAttribute: true,
        observer: '_responseChanged2',
      },      
      currentState: {
        type: Boolean,
        notify: true,
        reflectToAttribute: true,
        observer: '_stateChanged',
      },
      currentState2: {
        type: Boolean,
        notify: true,
        reflectToAttribute: true,
        observer: '_stateChanged2',
      },
       
      hideDropdown: {
        type: Boolean,
        value: true,
        observer: '_valueChanged',
      },
      alarmCount: {
        type: Number,
        value:0,
        notify: true
      },
      hideAck: {
        type: Boolean,
        value: true
      },
      alarmArray: {
        type: Array,
        reflectToAttribute: true,
        notify: true,
        value() {
          return []
        }
      },
      output: {
          type : String,
          notify:true
      },
      output2: {
        type : String,
        notify:true
    },
    
      alarmId: {
        type: String
      },
      alarmArrow:{
        type : String,
        value: "abb_icon_16 ui_down",
        notify: true,
        reflectToAttribute: true
      },
    }
  }
  _sendMessage() {
    //message = new Paho.MQTT.Message("data");
    //message.destinationName = "/ui/camera";
    this.$.vws._sendMessage( "{ 'name': 'abc' }");

    //client.send(message);
  }
  _sendMessage2() {
    //message = new Paho.MQTT.Message("data");
    //message.destinationName = "/ui/camera";
    this.$.vws2._sendMessage( "{ 'name': 'abc123' }");

    //client.send(message);
  }
  
  _hello() {
      console.log("hello");

  }

  _responseChanged(response) {
    console.log(response.payloadString);
    this.set('output', response.payloadString);
    //this.alarmCount = this.alarmArray.length;
  }
  _responseChanged2(response2) {
    console.log(response2.payloadString);
    this.set('output2', response2.payloadString);
    //this.alarmCount = this.alarmArray.length;
  }
  
  _stateChanged(currentState) {
    if (!currentState) {
      this.$.vws._createWebSocket();
      this.currentState = true;
    }
  }
  _stateChanged2(currentState2) {
    if (!currentState2) {
      this.$.vws2._createWebSocket();
      this.currentState2 = true;
    }
  }
  
  _valueChanged(hideDropdown)
  { 
    if(hideDropdown)
        this.updateStyles({"--show-alarms-list": "none"});
    else
      if(this.alarmCount > 0)
        this.updateStyles({"--show-alarms-list": "table-row"});
  }
  _loadPage() {
    this.hideDropdown = this.hideDropdown ? false : true;
    this.alarmArrow = "abb_icon_16 ui_down";
    window.sessionStorage.setItem("backRoute", "/administration/home");
    window.sessionStorage.setItem("currentRoute", '/alarmdetails');
    this.set('route.path', '/alarmdetails');
  }
  _getLatestAlarm() {
    if (this.alarmArray != undefined && this.alarmArray.length >= 1) {
      var lAlarm = this.alarmArray[this.alarmArray.length - 1].message;
      this.alarmId = this.alarmArray[this.alarmArray.length - 1].id;

      this.hideAck = false;
      return lAlarm;
    }
    else {
      this.hideAck = true;
      return " No Alarms Found!"
    }
  }
  _acknowledgeAlarm(e) {
    for (var i = 0; i < this.alarmArray.length; i++) {
      if (this.alarmArray[i].id == e.target.id) {
        this.alarmArray[i].ack = "true";

        this.$.vws._sendMessage(this.alarmArray[i]);
        break;
      }
    }
  }
  _isNotLatest(item) {
    return item.id != this.alarmId;
  }
}

window.customElements.define(VisionAlarm.is, VisionAlarm);
