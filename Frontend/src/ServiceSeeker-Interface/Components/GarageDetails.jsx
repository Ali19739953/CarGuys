import React, { useState, useEffect } from "react";
import styles from "../Modules/GarageDetails.module.css";
import { calculateDistance } from "../../utils/distanceCalculator";

function GarageDetails({ garage, garageDetails }) {
  const [address, setAddress] = useState("Loading address...");
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    const reverseGeocode = async (lat, lng) => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const data = await response.json();
        if (data.display_name) {
          setAddress(data.display_name);
        } else {
          setAddress("Address not found");
        }
      } catch (error) {
        console.error("Error reverse geocoding:", error);
        setAddress("Error fetching address");
      }
    };

    if (garage.garage_location) {
      reverseGeocode(garage.garage_location.lat, garage.garage_location.lng);
    }
  }, [garage.garage_location]);

  useEffect(() => {
    if (garage.distance) {
      setDistance(garage.distance);
    }
  }, [garage.distance]);

  if (!garageDetails) return <div>Loading garage details...</div>;

  return (
    <section className={styles.GarageDetails_Main}>
      <section className={styles.GarageDetails_Description}>
        <div className={styles.GarageDetails_Description_Header}>
          <strong>Garage Description</strong>
        </div>
        <div className={styles.GarageDetails_Description_Box}>
          <p className={styles.GarageDetails_Description_Box_Text}>
            {garageDetails.description || "No description available"}
          </p>
        </div>
      </section>

      <section className={styles.GarageDetails_LocationArea}>
        <div className={styles.GarageDetails_LocationAreaHeader}>
          <strong>Garage Location</strong>
        </div>
        <div className={styles.GarageDetails_LocationAreaContent}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.GarageDetails_Icon}>
            <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          <span>{address}</span>
          {distance !== null && (
            <p>Distance: {distance.toFixed(2)} km</p>
          )}
        </div>
      </section>

      <section className={styles.GarageDetails_Phone}>
        <div className={styles.GarageDetails_PhoneHeader}>
          <strong>Phone Number</strong>
        </div>
        <div className={styles.GarageDetails_PhoneContent}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.GarageDetails_Icon}>
            <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
          </svg>
          <span>{garage.garage_phonenumber || "Phone number not available"}</span>
        </div>
      </section>

      <section className={styles.GarageDetails_Email}>
        <div className={styles.GarageDetails_EmailHeader}>
          <strong>Email</strong>
        </div>
        <div className={styles.GarageDetails_EmailContent}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.GarageDetails_Icon}>
            <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
            <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
          </svg>
          <span>{garage.garage_email || "Email not available"}</span>
        </div>
      </section>
    </section>
  );
}

export default GarageDetails;
