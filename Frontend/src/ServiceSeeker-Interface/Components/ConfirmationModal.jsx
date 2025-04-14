import React from 'react';
import styles from './../Modules/Confirmation.module.css';

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
    if (!isOpen) return null;

    return (
        <div className={styles['modal-overlay']}>
            <div className={styles['modal-content']}>
                <h2>{title}</h2>
                <p>{message}</p>
                <div className={styles['modal-buttons']}>
                    <button 
                        className={`${styles['modal-button']} ${styles['confirm']}`} 
                        onClick={onConfirm}
                    >
                        Confirm
                    </button>
                    <button 
                        className={`${styles['modal-button']} ${styles['cancel']}`} 
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmationModal;