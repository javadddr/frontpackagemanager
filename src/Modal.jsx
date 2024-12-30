import React from 'react';
import './Modal.css';
import one from "./one.gif";
import two from "./two.gif";

const Modal = ({ show, message, onClose, alertType }) => {
  if (!show) {
    return null;
  }

  return (
    <div className='modal-backdrop custom-backdrop'>
      <div className="modal-contentert">
        <div className="gif-container">
          {alertType === 'success' ? (
            <img src={one} alt="Two" className="gif-two" style={{width:"120px",marginBottom:"20px"}}/>
          ) : (
            <img src={two} alt="One" className="gif-one" style={{width:"120px",marginBottom:"20px",marginLeft:'120px'}}/>
          )}
        </div>
        <p>{message}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Modal;
