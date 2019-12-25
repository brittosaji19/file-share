import React from "react";
import "./style.css";
const ProgressBar = props => {
  let { value, max } = props;
  let progress = (value / max) * 100;
  return (
    <div className="ProgressBarContainer">
      <div
        className="ProgressBarProgress"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};
export default ProgressBar;
