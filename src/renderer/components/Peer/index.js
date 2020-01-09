import React from "react";
import ProgressBar from "../ProgressBar";
import PersonIcon from "../../../assets/icons/person.png";
import { ipcRenderer } from "electron";
import "./style.css";
const Peer = props => {
  // let fileInputRef = React.createRef();
  // let [showOptionsPopup, setShowOptionsPopup] = React.useState(false);
  return (
    <div
      style={{ ...props.rootStyle }}
      className="PeerContainer centerize column"

      // onMouseLeave={() => {
      //   setShowOptionsPopup(false);
      // }}
    >
      <div
        className="PeerPersonIconWrapper centerize"
        // onMouseOver={() => {
        //   setShowOptionsPopup(true);
        // }}
        onClick={() => {
          // console.log(fileInputRef);
          // if (fileInputRef.current) fileInputRef.current.click();
          ipcRenderer
            .invoke("peer-icon-click", { peer: props.peer })
            .then(files => {
              console.log(files);
              props.handleFileChange(props.peer, files);
            });
        }}
      >
        <img src={PersonIcon} alt="person" />
      </div>
      <p className="PeerTitle">{props.title}</p>
      {props.activeTransfers &&
        props.activeTransfers.current < props.activeTransfers.max && (
          <ProgressBar
            max={props.activeTransfers.max}
            value={props.activeTransfers.current}
          />
        )}
      <p>{props.currentFile}</p>

      <input
        type="file"
        name="file"
        onChange={e => {
          if (!props.handleFileChange) return false;
          props.handleFileChange(props.peer, e.target.files);
        }}
        style={{ display: "none" }}
      />
      {props.incomingFile && (
        <div className={"PeerActionPopupContainer"}>
          <p>{`${props.incomingFile.hostname} is sending you a file`}</p>
          <div className={"PeerActionPopupActionButtonContainer"}>
            <div
              className={"centerize PeerActionButton PeerActionButtonCancel"}
              onClick={() => {
                props.rejectIncomingFile(
                  props.incomingFile.peer,
                  props.incomingFile.filename
                );
              }}
            >
              {" "}
              Reject
            </div>
            <div
              className={"centerize PeerActionButton PeerActionButtonConfirm"}
              onClick={() => {
                props.acceptIncomingFile(
                  props.incomingFile.peer,
                  props.incomingFile.filename
                );
              }}
            >
              {" "}
              Accept
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Peer;
