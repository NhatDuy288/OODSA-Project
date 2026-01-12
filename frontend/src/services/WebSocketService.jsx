// WebSocketService.js
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { AuthService } from "../services/auth.service";

class WebSocketService {
  client = null;
  subscriptions = {};
  connect(onConnect) {
    this.client = new Client({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_SOCKET_URL),
      connectHeaders: {
        Authorization: `Bearer ${AuthService.getToken()}`,
      },
      onConnect,
    });

    this.client.activate();
  }

  subscribe(topic, callback) {
    if (!this.client || !this.client.connected) return;
    return this.client.subscribe(topic, (msg) =>
      callback(JSON.parse(msg.body))
    );
  }
  unsubscribe(topic) {
    if (this.subscriptions[topic]) {
      this.subscriptions[topic].unsubscribe();
      delete this.subscriptions[topic];
    }
  }
  send(destination, body) {
    if (!this.client || !this.client.connected) return;

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  disconnect() {
    if (this.client) this.client.deactivate();
  }
}

export default new WebSocketService();
