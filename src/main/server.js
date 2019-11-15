import express from "express";
import http from "http";
import { PORT } from "../utilities/constants";
import WebSocket from "ws";
import os from "os";
class Server {
  constructor() {
    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.httpServer.listen(PORT);
    console.log("server listening on port ", PORT);
    console.log("hostname ",os.hostname())
  }
  initializeWebSocket = () => {
    this.wss = new WebSocket.Server({
      server: this.httpServer
    });
  };
}
export default Server;
