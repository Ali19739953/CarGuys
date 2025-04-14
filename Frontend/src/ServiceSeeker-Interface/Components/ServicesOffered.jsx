import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import styles from '../Modules/ServicesOffered.module.css';

const ServicesOffered = ({ garage }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 10;

  useEffect(() => {
    const fetchServices = async () => {
      if (!garage || !garage.id) {
        setError('No garage ID provided');
        setLoading(false);
        return;
      }

      try {
        const db = getFirestore();
        const garageDetailsRef = doc(db, 'GarageDetails', garage.id);
        const garageDetailsSnap = await getDoc(garageDetailsRef);

        if (garageDetailsSnap.exists()) {
          const garageDetailsData = garageDetailsSnap.data();
          console.log("ServicesOffered - Fetched data:", garageDetailsData);
          setServices(garageDetailsData.services || []);
        } else {
          console.log("ServicesOffered - Garage details not found");
          setError('Garage details not found');
        }
        setLoading(false);
      } catch (e) {
        console.error('ServicesOffered - Error fetching services:', e);
        setError('Failed to fetch services');
        setLoading(false);
      }
    };

    fetchServices();
  }, [garage]);

  // Calculate pagination values
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = services.slice(indexOfFirstService, indexOfLastService);
  const totalPages = Math.ceil(services.length / servicesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) return <div className={styles.loading}>Loading services...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.servicesContainer}>
      <h2 className={styles.servicesHeader}>Services Offered</h2>
      <div className={styles.servicesGrid}>
        {currentServices.length > 0 ? (
          currentServices.map((service, index) => (
            <div key={index} className={styles.serviceBox}>
              <span className={styles.serviceText}>{service}</span>
            </div>
          ))
        ) : (
          <p className={styles.noServices}>No services available</p>
        )}
      </div>
      
      {services.length > servicesPerPage && (
        <div className={styles.pagination}>
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.paginationButton}
          >
            Previous
          </button>
          
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`${styles.paginationButton} ${currentPage === index + 1 ? styles.active : ''}`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.paginationButton}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ServicesOffered;
