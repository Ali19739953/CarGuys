import React, { useState, useEffect } from "react";
import styles from "../Modules/Bankdetails.module.css";
import { auth, firestore } from "../../firebaseConfig";

function BankDetails() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    beneficiaryName: "",
    accountNumber: "",
    IBAN: "",
    bankName: "",
    swiftCode: "",
  });

  useEffect(() => {
    const fetchBankDetails = async () => {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        try {
          const doc = await firestore.collection("GarageDetails").doc(userId).get();
          if (doc.exists && doc.data().bankDetails) {
            setBankDetails(doc.data().bankDetails);
          }
        } catch (error) {
          console.error("Error fetching bank details:", error);
        }
      }
    };

    fetchBankDetails();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBankDetails({ ...bankDetails, [name]: value });
  };

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  const handleSave = async () => {
    if (auth.currentUser) {
      const userId = auth.currentUser.uid;
      try {
        await firestore.collection("GarageDetails").doc(userId).update({
          bankDetails: bankDetails
        });
        console.log("Bank Details Saved:", bankDetails);
        alert("Bank details saved successfully!");
        toggleModal();
      } catch (error) {
        console.error("Error saving bank details:", error);
        alert("Error saving bank details. Please try again.");
      }
    }
  };

  return (
    <div className={styles.bankdetailsContainer}>
      <button className={styles.openModalButton} onClick={toggleModal}>
        {bankDetails.beneficiaryName ? "Edit Bank Details" : "Add Bank Details"}
      </button>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h4>Bank Details</h4>

            <label className={styles.modalLabel}>
              Beneficiary name
              <input
                type="text"
                name="beneficiaryName"
                className={styles.modalInput}
                value={bankDetails.beneficiaryName}
                onChange={handleInputChange}
              />
            </label>

            <label className={styles.modalLabel}>
              Account Number:
              <input
                type="text"
                name="accountNumber"
                className={styles.modalInput}
                value={bankDetails.accountNumber}
                onChange={handleInputChange}
              />
            </label>

            <label className={styles.modalLabel}>
              IBAN number:
              <input
                type="text"
                name="IBAN"
                className={styles.modalInput}
                value={bankDetails.IBAN}
                onChange={handleInputChange}
              />
            </label>

            <label className={styles.modalLabel}>
              Bank name:
              <input
                type="text"
                name="bankName"
                className={styles.modalInput}
                value={bankDetails.bankName}
                onChange={handleInputChange}
              />
            </label>

            <label className={styles.modalLabel}>
              Swift Code:
              <input
                type="text"
                name="swiftCode"
                className={styles.modalInput}
                value={bankDetails.swiftCode}
                onChange={handleInputChange}
              />
            </label>

            <div className="GarageDetailsModalButtons">
              <div className="GarageDetailsModalButtons_save">
                <button
                  className={styles.saveBankDetailsModal}
                  onClick={handleSave}
                >
                  <strong>Save Bank Details</strong>
                </button>
              </div>

              <button className={styles.closeModalButton} onClick={toggleModal}>
                <strong>Close</strong>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BankDetails;
