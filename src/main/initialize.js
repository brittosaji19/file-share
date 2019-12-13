import Server from "src/main/server";
import NetWorkScanner from "src/main/scanner";
import PeerManager from "src/main/peermanager";
import EventManager from "src/main/eventmanager";
import { PORT } from "../utilities/constants";
const initializeServer = (window) => {
  let server = new Server(window);
  let eventManager = server.getEventManager();
  let peerManager = server.getPeerManager();
  let networkScanner = new NetWorkScanner();
  eventManager.listenAll();
  scanNetwork(networkScanner, peerManager);
  setInterval(() => {
    scanNetwork(networkScanner, peerManager);
  }, 10000);
};
export { initializeServer };

const scanNetwork = (networkScanner, peerManager) => {
  networkScanner.scan().then(local_peers => {
    console.log(local_peers, local_peers.length);
    peerManager.updateKnownPeers(local_peers);
    peerManager.getHostNames(local_peers);
  });
};
