import React, { useState } from 'react';
import styles from '../Modules/PaymentMethods.module.css';

const PaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const addPaymentMethod = (newMethod) => {
    setPaymentMethods([...paymentMethods, { ...newMethod, id: Date.now() }]);
  };

  const editPaymentMethod = (updatedMethod) => {
    setPaymentMethods(paymentMethods.map(method => 
      method.id === updatedMethod.id ? updatedMethod : method
    ));
  };

  const removePaymentMethod = () => {
    if (selectedMethod) {
      setPaymentMethods(paymentMethods.filter(method => method.id !== selectedMethod));
      setSelectedMethod(null);
    }
  };

  const handleEdit = () => {
    if (selectedMethod) {
      setIsEditing(true);
      setShowModal(true);
    }
  };

  return (
    <div className={styles.paymentMethods}>
      <h2>Payment Methods</h2>
      {paymentMethods.length === 0 ? (
        <p className={styles.noMethods}>No payment methods added yet, Complete the payments through stripe.</p>
      ) : (
        <div className={styles.methodList}>
          {paymentMethods.map(method => (
            <div key={method.id} className={styles.methodItem}>
              <input
                type="radio"
                checked={selectedMethod === method.id}
                onChange={() => setSelectedMethod(method.id)}
                className={styles.radioInput}
              />
              <div className={styles.methodDetails}>
                <p><strong>Card Holder:</strong> {method.cardHolderName}</p>
                <p><strong>Card Number:</strong> **** **** **** {method.cardNumber.slice(-4)}</p>
                <p><strong>Expiry:</strong> {method.expiryDate}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className={styles.methodActions}>
        <button 
          className={`${styles.actionButton} ${styles.removeButton}`}
          onClick={removePaymentMethod} 
          disabled={!selectedMethod}
        >
          Remove
        </button>
        <button 
          className={`${styles.actionButton} ${styles.editButton}`}
          onClick={handleEdit} 
          disabled={!selectedMethod}
        >
          Edit
        </button>
        <button 
          className={`${styles.actionButton} ${styles.addButton}`}
          onClick={() => { setIsEditing(false); setShowModal(true); }}
          disabled={true}
        >
          Add Payment Method
        </button>
      </div>
      {showModal && (
        <PaymentMethodModal
          onClose={() => { setShowModal(false); setIsEditing(false); }}
          onSave={isEditing ? editPaymentMethod : addPaymentMethod}
          paymentMethod={isEditing ? paymentMethods.find(method => method.id === selectedMethod) : null}
        />
      )}
    </div>
  );
};

const PaymentMethodModal = ({ onClose, onSave, paymentMethod }) => {
  const [methodInfo, setMethodInfo] = useState(paymentMethod || {
    cardHolderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    // Format input based on field
    if (name === 'cardNumber') {
      updatedValue = value.replace(/\D/g, '').slice(0, 16);
      updatedValue = updatedValue.replace(/(\d{4})/g, '$1 ').trim();
    } else if (name === 'expiryDate') {
      updatedValue = value.replace(/\D/g, '').slice(0, 4);
      if (updatedValue.length > 2) {
        updatedValue = updatedValue.slice(0, 2) + '/' + updatedValue.slice(2);
      }
    } else if (name === 'cvv') {
      updatedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setMethodInfo({ ...methodInfo, [name]: updatedValue });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!methodInfo.cardHolderName.trim()) {
      newErrors.cardHolderName = 'Please enter card holder name';
    }
    if (!methodInfo.cardNumber || methodInfo.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }
    if (!methodInfo.expiryDate || !methodInfo.expiryDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    }
    if (!methodInfo.cvv || methodInfo.cvv.length !== 3) {
      newErrors.cvv = 'Please enter a valid 3-digit CVV';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(methodInfo);
      onClose();
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>{paymentMethod ? 'Edit Payment Method' : 'Add Payment Method'}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="cardHolderName">Card Holder Name</label>
            <input
              type="text"
              id="cardHolderName"
              name="cardHolderName"
              value={methodInfo.cardHolderName}
              onChange={handleChange}
            />
            {errors.cardHolderName && <span className={styles.error}>{errors.cardHolderName}</span>}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="cardNumber">Card Number</label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={methodInfo.cardNumber}
              onChange={handleChange}
              placeholder="1234 5678 9012 3456"
            />
            {errors.cardNumber && <span className={styles.error}>{errors.cardNumber}</span>}
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="expiryDate">Expiry Date</label>
              <input
                type="text"
                id="expiryDate"
                name="expiryDate"
                value={methodInfo.expiryDate}
                onChange={handleChange}
                placeholder="MM/YY"
              />
              {errors.expiryDate && <span className={styles.error}>{errors.expiryDate}</span>}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="cvv">CVV</label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                value={methodInfo.cvv}
                onChange={handleChange}
                placeholder="123"
              />
              {errors.cvv && <span className={styles.error}>{errors.cvv}</span>}
            </div>
          </div>
          <div className={styles.modalActions}>
            <button type="submit" className={styles.saveButton}>Save</button>
            <button type="button" className={styles.cancelButton} onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentMethods;