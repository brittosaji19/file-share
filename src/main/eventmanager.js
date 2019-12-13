class EventManager {
  constructor(server) {
    this.server = server;
    this.ioserver = server.getIO();
    this.ioclient = server.getIOClient();
  }

  requestHostname(peer) {
    let ioconnection = this.ioclient(
      `http://${peer.ip}:${this.server.getPort()}/`
    );
    ioconnection.emit("send_hostname", { ip: peer.ip });
    this.listenForHostname(ioconnection);
  }

  listenForHostnameRequest(socket) {
    socket.on("send_hostname", data => {
      console.log("got send_hostname from io");
      socket.emit("hostname", { ...data, hostname: this.server.getHostName() });
    });
  }
  listenForHostname(connection) {
    connection.on("hostname", data => {
      let peerManager = this.server.getPeerManager();
      peerManager.updateHostnameAssociation(data.ip, data.hostname);
    });
  }
  listenForPeerListRequest() {
    this.server.ipcMain().handle("local_peer", (event, args) => {
      let peerManager = this.server.getPeerManager();
      return peerManager.getKnownPeers();
    });
  }
  listenForFileTransferRequest() {
    this.server.ipcMain().handle("sendFile", (event, peer, file) => {
      let peerManager = this.server.getPeerManager();
      peerManager.sendFileToPeer(peer, file);
    });
  }
  listenForIncomingFileRequest(socket) {
    socket.on("incoming_file_request", data => {
      let peerManager = this.server.getPeerManager();
      peerManager.handleIncomingFileRequest(socket, data.peer, data.filename);
    });
  }
  listenAll() {
    this.ioserver.on("connection", socket => {
      this.listenForHostnameRequest(socket);
      this.listenForIncomingFileRequest(socket);
    });
    this.listenForPeerListRequest();
    this.listenForFileTransferRequest();
  }
}
export default EventManager;
