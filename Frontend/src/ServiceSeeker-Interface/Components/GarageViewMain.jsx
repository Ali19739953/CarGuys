//sunday and saturday have issues
import React, { useState, useEffect } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import GarageDetails from './GarageDetails';
import Reviews from './Reviews';
import ServicesOffered from './ServicesOffered';
import OperatingHours from './OperatingHours';
import styles from "../Modules/GarageViewMain.module.css";
import axios from 'axios';

const GarageViewMain = ({ garage, userInfo, garageDetails }) => {
  const [activeComponent, setActiveComponent] = useState('garageDetails');
  const [isOpenNow, setIsOpenNow] = useState(false);
  const [currentTime, setCurrentTime] = useState(null);
const navigate = useNavigate();
const handleBookAService = () => {
  if(!isOpenNow){
    alert("Garage is currently closed,Contact the garage for more information via Client Messenger");
    return;
  }
  navigate(`/BookingService/${garage.id}`, { state: { garage, userInfo, garageDetails } });
};
  useEffect(() => {
    setCurrentTime(new Date());
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (currentTime && garageDetails && garageDetails.operatingHours) {
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const currentDay = daysOfWeek[currentTime.getDay()];
      const currentHour = currentTime.getHours();
      const currentMinute = currentTime.getMinutes();
      
      const todayHours = garageDetails.operatingHours[currentDay];

      if (todayHours && todayHours.isOpen) {
        const [openHour, openMinute] = todayHours.openTime.split(':').map(Number);
        const [closeHour, closeMinute] = todayHours.closeTime.split(':').map(Number);

        const isWithinOpenHours = 
          (currentHour > openHour || (currentHour === openHour && currentMinute >= openMinute)) &&
          (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute));

        setIsOpenNow(isWithinOpenHours);
      } else {
        setIsOpenNow(false);
      }
    } else {
      // Handle the case where currentTime or garageDetails is not available
      console.log("Current time or garage details not available yet");
      setIsOpenNow(false);
    }
  }, [currentTime, garageDetails]);

  // const bookingLink = garage && garage.id
  //   ? {
  //       pathname: `/BookingService/${garage.id}`,
  //       state: {
  //         garageName: garage.garage_name,
  //         garageDetails: garageDetails
  //       }
  //     }
  //   : null;

  const renderComponent = () => {
    switch (activeComponent) {
      case 'garageDetails':
        return <GarageDetails garage={garage} garageDetails={garageDetails} />;
      case 'operatingHours':
        return <OperatingHours garage={garage} garageDetails={garageDetails} />;
      case 'services':
        return <ServicesOffered garage={garage} garageDetails={garageDetails} />;
      case 'reviews':
        return <Reviews garageId={garage.id} />;
      default:
        return null;
    }
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    return new Date(0, 0, 0, hours, minutes).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderOperatingHours = () => {
    if (!garageDetails || !garageDetails.operatingHours) return null;

    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
      <div className={styles.OperatingHours}>
        <h3>Operating Hours</h3>
        <ul>
          {daysOrder.map(day => (
            <li key={day}>
              <span>{day}: </span>
              {garageDetails.operatingHours[day].isOpen ? (
                <span>{formatTime(garageDetails.operatingHours[day].openTime)} - {formatTime(garageDetails.operatingHours[day].closeTime)}</span>
              ) : (
                <span>Closed</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (!garage || !userInfo || !garageDetails) {
    return <div>Loading garage details...</div>;
  }

  console.log("Garage data received in GarageViewMain:", garage);
  console.log("User info received in GarageViewMain:", userInfo);
  console.log("Garage details received in GarageViewMain:", garageDetails);

  // Check if operatingHours exists in garageDetails
  if (garageDetails.operatingHours) {
    console.log("Operating Hours from garageDetails:", garageDetails.operatingHours);
  } else {
    console.log("Operating Hours not found in garageDetails");
  }

  return (
    <main className={styles.GarageViewMain_Main}>
      <section className={styles.GarageViewMain_PfpAndBanner}>
        <div className={styles.GarageViewMain_PfpAndBanner_Banner}>
          <img
            src={garageDetails.bannerImageUrl || '/path/to/placeholder-banner.jpg'}
            alt="Garage banner"
            className={styles.GarageViewMain_PfpAndBanner_Banner_Img}
          />
        </div>

        <div className={styles.GarageViewMain_PfpAndBanner_Pfp}>
          <img
            src={garage.profileImageUrl}
            alt="Garage profile"
            className={styles.GarageViewMain_PfpAndBanner_Pfp_Img}
          />
        </div>
      </section>

      <section className={styles.GarageViewMain_Content}>
        <div className={styles.GarageViewMain_Conent_GarageInfo}>
          <ul className={styles.GarageViewMain_Conent_GarageInfo_Ul}>
            <li className={styles.GarageViewMain_Conent_GarageInfo_Li}>
              <h1>{garage.garage_name}</h1>
              <div className={styles.GarageViewMain_Conent_GarageInfo_Status}>
                {typeof garage.distance === 'number' && (
                  <span>Distance: {garage.distance.toFixed(2)} km</span>
                )}
                <br></br>
                {currentTime && (
                  <span className={isOpenNow ? styles.OpenNow : styles.ClosedNow}>
                    {isOpenNow ? '  Open Now' : '  Closed'} - {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </li>
          </ul>
        </div>

        <section className={styles.GarageViewMain_Actions}>
       <button
          onClick={handleBookAService}
          className={styles.GarageViewMain_Actions_BookAServiceButton}
        >
          
          Book a Service
        </button>

        </section>

        <nav className={styles.GarageViewMain_SortBar}>
          <button
            className={activeComponent === 'garageDetails' ? `${styles.GarageViewMain_NavigationButton} ${styles.GarageViewMain_NavigationButtonactive}` : styles.GarageViewMain_NavigationButton}
            onClick={() => setActiveComponent('garageDetails')}
          >
            Garage Details
          </button>
          <button
            className={activeComponent === 'operatingHours' ? `${styles.GarageViewMain_NavigationButton} ${styles.GarageViewMain_NavigationButtonactive}` : styles.GarageViewMain_NavigationButton}
            onClick={() => setActiveComponent('operatingHours')}
          >
            Operating Hours
          </button>
          <button
            className={activeComponent === 'services' ? `${styles.GarageViewMain_NavigationButton} ${styles.GarageViewMain_NavigationButtonactive}` : styles.GarageViewMain_NavigationButton}
            onClick={() => setActiveComponent('services')}
          >
            Services
          </button>
          <button
            className={activeComponent === 'reviews' ? `${styles.GarageViewMain_NavigationButton} ${styles.GarageViewMain_NavigationButtonactive}` : styles.GarageViewMain_NavigationButton}
            onClick={() => setActiveComponent('reviews')}
          >
            Reviews
          </button>
        </nav>
      </section>

      <section className="component-display">
        {renderComponent()}
      </section>
    </main>
  );
};

export default GarageViewMain;
