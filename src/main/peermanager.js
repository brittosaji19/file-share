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
    let transferControl = this.server.getTransferControl();
    let fileId = transferControl.addFileToContext(
      file.name,
      file.path,
      file.data
    );
    this.requestFileAcceptance(peer, file.name)
      .then((ioconnection, peer) => {
        // console.log(transferControl);
        ioconnection.emit("start_upload", {
          id: fileId,
          name: file.name,
          size: file.data.length
        });
        ioconnection.on("send_slice", (id, slice, size) => {
          transferControl.sendFileSlice(ioconnection, fileId, slice, size);
        });
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
        socket.emit("incoming_file_accepted", { ip: peer.ip });
        socket.on("start_upload", file => {
          let transferControl = this.server.getTransferControl();
          transferControl.registerIncomingFile(
            file.id,
            socket,
            file.name,
            file.size
          );
          transferControl.grabSlices(file.id);
        });
      });
  }
}

export default PeerManager;
