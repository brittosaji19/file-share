import { dialog } from "electron";
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
  listenForPeerIconClick() {
    this.server.ipcMain().handle("peer-icon-click", (event, args) => {
      return dialog.showOpenDialogSync({
        properties: ["openFile", "multiSelections"]
      });
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
      let remote_address = socket.handshake.address.split("::ffff:")[1];
      console.log("Remote Address", remote_address);
      peerManager.handleIncomingFileRequest(
        socket,
        data.peer,
        data.filename,
        remote_address
      );
    });
  }
  listenAll() {
    this.server.ipcMain().handle("show_main_window", event => {
      this.server.getWindow().show();
    });
    this.ioserver.on("connection", socket => {
      this.listenForHostnameRequest(socket);
      this.listenForIncomingFileRequest(socket);
    });
    this.listenForPeerListRequest();
    this.listenForFileTransferRequest();
    this.listenForPeerIconClick();
  }
}
export default EventManager;
