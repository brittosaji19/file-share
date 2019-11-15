import ip from "ip";
import evilscan from "evilscan";
import { PORT } from "../utilities/constants";

class NetWorkScanner {
  getIP() {
    return ip.address();
  }
  getSubnet() {
    return ip.subnet(this.getIP(), "255.255.255.0");
  }
  scan() {
    let clients = [];
    console.log(
      `${this.getSubnet().firstAddress}-${this.getSubnet().lastAddress}`
    );
    let options = {
      target: `${this.getSubnet().firstAddress}-${
        this.getSubnet().lastAddress
      }`,
      port: PORT,
      status: "TROU", // Timeout, Refused, Open, Unreachable
      banner: true
    };
    let scanner = new evilscan(options);
    scanner.on("result", function(data) {
      // fired when item is matching options
      if(data.status==="open")clients.push(data);
    });

    scanner.on("error", function(err) {
      throw new Error(data.toString());
    });

    scanner.on("done", function() {
      // finished !
      console.log(clients);
      return clients;
    });
    scanner.run();
  }
}
export default NetWorkScanner;
