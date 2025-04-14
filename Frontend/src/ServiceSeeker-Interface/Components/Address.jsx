import React, { useState, useEffect } from 'react';
import styles from "../Modules/Address.module.css";
import { useSelector } from 'react-redux';
import { selectUserInfo } from '../../Redux/Features/SharedSlices/Users/userSlice';
import reverseGeocode from '../../api/reverseGeocode';

const Address = () => {
  const userInfo = useSelector(selectUserInfo);

  const [addresses, setAddresses] = useState(() => {
    if (userInfo?.location) {
      return [{
        id: Date.now(),
        lat: userInfo.location.lat,
        lng: userInfo.location.lng,
        address: ''
      }];
    }
    return [];
  });

  useEffect(() => {
    const fetchAddress = async () => {
      if (userInfo?.location) {
        try {
          const addressData = await reverseGeocode(
            userInfo.location.lat,
            userInfo.location.lng
          );
          
          if (addressData) {
            setAddresses([{
              id: Date.now(),
              lat: userInfo.location.lat,
              lng: userInfo.location.lng,
              address: addressData
            }]);
          }
        } catch (error) {
          console.error('Error fetching address:', error);
        }
      }
    };

    fetchAddress();
  }, [userInfo?.location]);

  const [showModal, setShowModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const addAddress = (newAddress) => {
    setAddresses([...addresses, { ...newAddress, id: Date.now() }]);
  };

  const editAddress = (updatedAddress) => {
    setAddresses(addresses.map(addr => 
      addr.id === updatedAddress.id ? updatedAddress : addr
    ));
  };

  const removeAddress = () => {
    if (selectedAddress) {
      setAddresses(addresses.filter(addr => addr.id !== selectedAddress));
      setSelectedAddress(null);
    }
  };

  const handleEdit = () => {
    if (selectedAddress) {
      setIsEditing(true);
      setShowModal(true);
    }
  };

  return (
    <div className={styles.address}>
      <h2>Addresses</h2>
      {addresses.length === 0 ? (
        <p className={styles.noAddress}>No addresses added yet.</p>
      ) : (
        <div className={styles.addressList}>
          {addresses.map(address => (
            <div key={address.id} className={styles.addressItem}>
              <input
                type="radio"
                checked={selectedAddress === address.id}
                onChange={() => setSelectedAddress(address.id)}
                className={styles.radioInput}
              />
              <div className={styles.addressDetails}>
                <p><strong>Address:</strong> {address.address}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className={styles.addressActions}>
        <button 
          className={`${styles.actionButton} ${styles.removeButton}`} 
          onClick={removeAddress} 
          disabled={!selectedAddress}
        >
          Remove
        </button>
        <button 
          className={`${styles.actionButton} ${styles.editButton}`} 
          onClick={handleEdit} 
          disabled={!selectedAddress}
        >
          Edit
        </button>
        <button 
          className={`${styles.actionButton} ${styles.addButton}`} 
          onClick={() => { setIsEditing(false); setShowModal(true); }}
          disabled={true}
        >
          Add Address Manually
        </button>
      </div>
      {showModal && (
        <AddressModal
          onClose={() => { setShowModal(false); setIsEditing(false); }}
          onSave={isEditing ? editAddress : addAddress}
          address={isEditing ? addresses.find(addr => addr.id === selectedAddress) : null}
        />
      )}
       <p className={styles.note}>Note: To edit/change your address, please contact the support team.</p>
    </div>
  );
};

const AddressModal = ({ onClose, onSave, address }) => {
  const [addressInfo, setAddressInfo] = useState(address || {
    address: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddressInfo({ ...addressInfo, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!addressInfo.address.trim()) newErrors.address = 'Please fill out this field.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(addressInfo);
      onClose();
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>{address ? 'Edit Address' : 'Add Address'}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={addressInfo.address}
              onChange={handleChange}
            />
            {errors.address && <span className={styles.error}>{errors.address}</span>}
          </div>
          <div className={styles.modalActions}>
            <button type="submit" className={styles.saveButton}>Save</button>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
        
      </div>
     
    </div>
  );
};

export default Address;