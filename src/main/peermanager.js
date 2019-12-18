class PeerManager {
  constructor(server) {
    this.server = server;
    this.eventManager = server.getEventManager();
    this.knownPeers = [];
  }
  getHostNames(peers) {
    peers.forEach(peer => {
      this.eventManager.requestHostname(peer);
    });
  }

  updateHostnameAssociation(ip, hostname) {
    let exists = false;
    for (let assoc of this.knownPeers) {
      if (assoc.ip == ip) {
        exists = true;
        assoc.hostname = hostname;
      }
    }
    if (!exists) {
      this.knownPeers.push({ ip: ip, hostname: hostname });
    }
  }
  updateKnownPeers(peers) {
    for (let peer of peers) {
      let exists = false;
      for (let assoc of this.knownPeers) {
        if (assoc.ip == peer.ip) {
          exists = true;
          assoc.hostname = assoc.hostname ? assoc.hostname : null;
        }
      }
      if (!exists) {
        this.knownPeers.push({ ip: peer.ip, hostname: null });
      }
    }
  }
  getKnownPeers() {
    return this.knownPeers;
  }
  sendFileToPeer(peer, file) {
    this.requestFileAcceptance(peer, file.name)
      .then((ioconnection, peer) => {
        console.log("file request accepted buhhahahaha", file);
        let transferControl = this.server.getTransferControl();
        console.log(transferControl);
        ioconnection.emit("start_upload");
      })
      .catch(error => {
        console.log(error);
      });
  }
  requestFileAcceptance(peer, filename) {
    return new Promise((resolve, reject) => {
      // console.log("file acceptance", peer);
      let ioclient = this.server.getIOClient();
      let ioconnection = ioclient(
        `http://${peer.ip}:${this.server.getPort()}/`
      );
      ioconnection.emit("incoming_file_request", {
        peer: peer,
        filename: filename
      });
      setTimeout(() => {
        reject("request timed-out");
      }, 60000);
      ioconnection.on("incoming_file_accepted", () => {
        resolve(ioconnection, peer, filename);
      });
      ioconnection.on("incoming_file_rejected", () => {
        reject("file rejected by peer");
      });
    });
  }
  handleIncomingFileRequest(socket, peer, filename) {
    this.server.getWindow().webContents.send("incoming_file", filename, peer);
    //Change this to once.
    this.server
      .ipcMain()
      .on("incoming_file_request_accepted", (event, peer, filename) => {
        console.log("Accepted File Request", filename, peer);
        socket.emit("incoming_file_accepted", { ip: peer.ip });
        // TODO: Start upload event handler
      });
  }
}

export default PeerManager;
