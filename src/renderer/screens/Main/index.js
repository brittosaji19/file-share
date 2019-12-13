import React from "react";
import { ipcRenderer } from "electron";
ipcRenderer.on("incoming_file", (event, filename, peer) => {
  if (confirm("Accept file " + filename)) {
    console.log("file accepted");
    ipcRenderer.send("incoming_file_request_accepted", peer, filename);
  } else {
    console.log("file rejected");
    ipcRenderer.send("file_rejected", peer, filename);
  }
});
const Main = props => {
  let [peers, setPeers] = React.useState([]);
  let [isLocalListenerListening, setisLocalListenerListening] = React.useState(
    false
  );
  const getLocalPeers = () => {
    ipcRenderer.invoke("local_peer").then(local_peers => {
      console.log(local_peers);
      //Order of below state updates is important.
      setisLocalListenerListening(true);
      setPeers(local_peers);
    });
  };
  if (!isLocalListenerListening) {
    getLocalPeers();
    setInterval(getLocalPeers, 10000);
  }

  const handleFileChange = (peer, files) => {
    console.log(peer, files);
    let fileStorage = [];
    for (let file of files) {
      let newFile = { name: file.name, path: file.path };
      let slice = file.slice(0, file.size);
      console.log("slice ", slice);
      let fileReader = new FileReader();
      fileReader.readAsArrayBuffer(slice);
      fileReader.onload = event => {
        console.log(fileReader.result);
        newFile["data"] = new Uint8Array(fileReader.result);
        ipcRenderer.invoke("sendFile", peer, newFile).then(response => {
          console.log(response);
        });
      };
    }
  };
  return (
    <div>
      <br />
      <h5>Peer List</h5>
      {peers.map(peer => {
        return (
          <div key={peer.ip}>
            <p>{peer.hostname ? peer.hostname : peer.ip}</p>
            <input
              type="file"
              name="file"
              onChange={e => {
                handleFileChange(peer, e.target.files);
              }}
            />
            <br />
          </div>
        );
      })}
    </div>
  );
};
export default Main;
