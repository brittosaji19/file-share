import React, { useEffect } from "react";
import { ipcRenderer } from "electron";
import Peer from "../../Components/Peer";
import "./style.css";

const SetIncomingFileListener = callback => {
  ipcRenderer.removeAllListeners("incoming_file");
  ipcRenderer.once("incoming_file", (event, filename, peer) => {
    let notification = new Notification("File Share", {
      body: `${peer.hostname} is sending you a file`
    });
    notification.onclick = () => {
      window.focus();
      ipcRenderer.invoke("show_main_window");
    };
    if (callback) callback(peer, filename);
  });
};
const SetDownloadProgressListener = callback => {
  // ipcRenderer.removeAllListeners("download_progress");
  // console.log("getting progress");
  ipcRenderer.on("download_progress", (event, peer, current, max) => {
    console.log("got progress", peer, current, max);
    callback(peer, current, max);
  });
};
// const title = "File Share";
// const options = { body: `${peer.hostname} is sending you a file` };
// const reg=navigator.serviceWorker.getRegistration();
// console.log(reg);

//OLD CODE
// if (confirm("Accept file " + filename)) {
//   // console.log("file accepted");
//   ipcRenderer.send("incoming_file_request_accepted", peer, filename);
// } else {
//   // console.log("file rejected");
//   ipcRenderer.send("file_rejected", peer, filename);
// }

const Main = props => {
  let [peers, setPeers] = React.useState([]);
  let [activeTransfers, setActiveTransfers] = React.useState({});
  let [activeAlerts, setActiveAlerts] = React.useState({});
  let [isLocalListenerListening, setisLocalListenerListening] = React.useState(
    false
  );
  let [
    isDownloadProgressListening,
    setisDownloadProgressListening
  ] = React.useState(false);
  useEffect(() => {
    console.log("update");
  });
  const getLocalPeers = () => {
    ipcRenderer.invoke("local_peer").then(local_peers => {
      setisLocalListenerListening(true);
      setPeers(local_peers);
    });
  };

  if (!isLocalListenerListening) {
    getLocalPeers();
    setInterval(getLocalPeers, 10000);
  }
  SetIncomingFileListener((peer, filename) => {
    let current = { ...activeAlerts };
    current[peer.ip] = {
      hostname: peer.hostname,
      filename: filename,
      peer: peer
    };
    setActiveAlerts(current);
  });
  if (!isDownloadProgressListening) {
    SetDownloadProgressListener((peer, value, max) => {
      console.log("setter params value", value);
      let current = {};
      current[peer.ip] = {};
      current[peer.ip]["current"] = value;
      current[peer.ip]["max"] = max;
      setActiveTransfers({ ...activeTransfers, ...current });
    });
    setisDownloadProgressListening(true);
  }

  const handleFileChange = (peer, files) => {
    console.log(peer, files);
    let fileStorage = [];
    for (let file of files) {
      let newFile = { name: file.name, path: file.path };
      ipcRenderer.invoke("sendFile", peer, newFile);
    }
  };

  const AcceptIncomingFile = (peer, filename) => {
    let current = activeAlerts;
    current[peer.ip] = null;
    setActiveAlerts(current);
    ipcRenderer.send("incoming_file_request_accepted", peer, filename);
  };
  const RejectIncomingFile = (peer, filename) => {
    let current = activeAlerts;
    current[peer.ip] = null;
    setActiveAlerts(current);
    ipcRenderer.send("file_rejected", peer, filename);
  };
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
      className={"MainBodyContainer"}
    >
      {peers.map(peer => {
        return (
          <Peer
            title={peer.hostname ? peer.hostname : peer.ip}
            hostname={peer.hostname}
            ip={peer.ip}
            peer={peer}
            rootStyle={{ margin: "8px" }}
            handleFileChange={handleFileChange}
            incomingFile={activeAlerts[peer.ip] ? activeAlerts[peer.ip] : null}
            acceptIncomingFile={AcceptIncomingFile}
            rejectIncomingFile={RejectIncomingFile}
            activeTransfers={activeTransfers[peer.ip]}
          />
        );
      })}
      {(!peers || peers.length === 0) && <div style={{color:'#555555'}}>Scanning please wait...</div>}
    </div>
  );
};
export default Main;
