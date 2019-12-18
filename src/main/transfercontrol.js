import uuid from "uuid/v4";
class TransferControl {
  constructor(server) {
    this.server = server;
    this.fileArray = [];
  }
  addFileToContext(name, path, data) {
    let id = uuid();
    this.fileArray.push({ id, name, path, data });
    return id;
  }
  removeFileFromContext(id) {
    //// TODO: Remove file from memory
  }
  getFileSlice() {}
  startUpload(id) {
    let file=this.getFile(id);
    
  }
  getFile(id) {
    for (let file of this.fileArray) {
      if (file.id === id) return file;
    }
  }
}
export default TransferControl;
