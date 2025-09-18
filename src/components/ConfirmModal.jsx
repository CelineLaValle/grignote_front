import React from "react";
import "../styles/layout/_confirmModal.scss";

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="modal">
      <div className="modal__content">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal__actions">
          <button className="modal__cancel" onClick={onCancel}>
            Annuler
          </button>
          <button className="modal__confirm" onClick={onConfirm}>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
