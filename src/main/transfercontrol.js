import uuid from "uuid/v4";
import fs from "fs";
import os from "os";
class TransferControl {
  constructor(server) {
    this.server = server;
    this.fileArray = [];
    this.incomingFiles = [];
  }
  addFileToContext(name, path) {
    let id = uuid();
    let data = fs.readFileSync(path);
    this.fileArray.push({ id, name, path, data });
    console.log(`${name.toUpperCase()} added to context with id ${id}`);
    return id;
  }
  getSize(id) {
    let file = this.getFile(id);
    if (!file) return false;
    return file.data.length;
  }
  removeFileFromContext(id) {
    //// TODO: Remove file from memory
  }
  sendFileSlice(connection, id, slice = 0, size = 10000) {
    let file = this.getFile(id);
    if (!file) return false;
    if (slice * size >= file.data.length) {
      console.log("end upload", slice * size, file.data.length);
      connection.emit("end_upload");
      return false;
    }
    console.log(
      "Size....Slice...",
      Math.min(slice * size, file.data.length),
      slice * size,
      Math.min(Math.max((slice + 1) * size, size), file.data.length)
    );
    let data = file.data.slice(
      slice * size,
      Math.min(Math.max((slice + 1) * size, size), file.data.length)
    );
    connection.emit("slice_upload", { fileId: file.id, data: data });
  }
  startUpload(id) {
    let file = this.getFile(id);
  }
  getFile(id) {
    for (let file of this.fileArray) {
      console.log(id, file);
      if (file.id === id) return file;
    }
    return false;
  }
  registerIncomingFile(id, connection, name, size) {
    this.incomingFiles.push({
      id: id,
      connection: connection,
      name: name,
      size: size,
      data: []
    });
    console.log("registered " + name + id);
  }
  grabSlices(id, peer) {
    let file = null;
    for (let incomingFile of this.incomingFiles) {
      if (incomingFile.id === id) file = incomingFile;
    }
    if (!file) return false;
    let current_slice = 0;
    // this.server.ipcMain().handle("download_progress", () => {
    //   return {
    //     peer: peer,
    //     current: Math.min(current_slice * 100000, file.size),
    //     max: file.size
    //   };
    // });

    file.connection.emit("send_slice");
    file.connection.on("slice_upload", slice => {
      console.log("slice received ", slice, current_slice, file.data.length);
      file.data.push(new Buffer(new Uint8Array(slice.data)));
      if (file.data.length < file.size) {
        current_slice += 1;
        file.connection.emit("send_slice", file.id, current_slice);
      }
      //Send progress update to UI
      this.server
        .getWindow()
        .webContents.send(
          "download_progress",
          peer,
          Math.min(file.data.length * 10000, file.size),
          file.size
        );
    });

    file.connection.on("end_upload", id => {
      console.log("end_log", file.data, file.data.length);
      let filebuffer = new Buffer.concat(file.data);
      console.log(filebuffer);
      fs.open(os.homedir() + "/Downloads/" + file.name, "w", (err, fd) => {
        console.log(fd, err);
        fs.write(fd, filebuffer, err => {
          if (err) return socket.emit("upload error");
          file.connection.emit("upload_success");
        });
      });
    });
  }
}
export default TransferControl;
