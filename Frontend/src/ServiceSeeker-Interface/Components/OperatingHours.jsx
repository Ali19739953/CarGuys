import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import styles from '../Modules/OperatingHours.module.css';

const OperatingHours = ({ garage }) => {
  const [hours, setHours] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHours = async () => {
      if (!garage?.id) {
        setError('No garage ID provided');
        setLoading(false);
        return;
      }

      try {
        const db = getFirestore();
        const garageDetailsRef = doc(db, 'GarageDetails', garage.id);
        const garageDetailsSnap = await getDoc(garageDetailsRef);

        if (garageDetailsSnap.exists()) {
          setHours(garageDetailsSnap.data().operatingHours || {});
        } else {
          setError('Garage details not found');
        }
        setLoading(false);
      } catch (e) {
        setError('Failed to fetch operating hours');
        setLoading(false);
      }
    };

    fetchHours();
  }, [garage]);

  if (loading) return <div className={styles.loading}>Loading operating hours...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className={styles.operatingHoursContainer}>
      <h2 className={styles.operatingHoursHeader}>Operating Hours</h2>
      <div className={styles.operatingHoursTable}>
        {daysOfWeek.map((day) => (
          <div key={day} className={styles.operatingHoursRow}>
            <div className={styles.dayColumn}>{day}</div>
            <div className={`${styles.statusColumn} ${hours && hours[day] && !hours[day].isOpen ? styles.closed : ''}`}>
              {hours && hours[day] && hours[day].isOpen ? 'Open' : 'Closed'}
            </div>
            <div className={styles.timeColumn}>
              {hours && hours[day] && hours[day].isOpen ? (
                <>
                  <span>{hours[day].openTime || 'N/A'}</span>
                  <span>To</span>
                  <span>{hours[day].closeTime || 'N/A'}</span>
                </>
              ) : (
                'N/A'
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OperatingHours;
