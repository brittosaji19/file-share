import express from "express";
import http from "http";
import { PORT } from "../utilities/constants";
import SocketIO from "socket.io";
import IOClient from "socket.io-client";
import os from "os";
import EventManager from "src/main/eventmanager";
import PeerManager from "src/main/peermanager";
import { ipcMain } from "electron";
class Server {
  constructor(window) {
    this.app = express();
    this.window=window;
    this.httpServer = http.createServer(this.app);
    this.io = SocketIO(this.httpServer);
    this.httpServer.listen(PORT);
    this.eventManager = new EventManager(this);
    this.peerManager = new PeerManager(this);
  }
  getApp() {
    return this.app;
  }
  getHostName() {
    return os.hostname().split(".")[0];
  }
  getIO() {
    return this.io;
  }
  getPort() {
    return PORT;
  }
  getIOClient() {
    return IOClient;
  }
  getEventManager() {
    return this.eventManager;
  }
  getPeerManager() {
    return this.peerManager;
  }
  ipcMain() {
    return ipcMain;
  }
  getWindow(){
    return this.window;
  }
}
export default Server;
