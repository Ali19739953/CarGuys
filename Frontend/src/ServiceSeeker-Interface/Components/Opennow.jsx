import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectUserInfo } from '../../Redux/Features/SharedSlices/Users/userSlice';
import { fetchAllGarages } from '../../api/garageUsers';
import { Link } from "react-router-dom";
import { calculateDistance } from "../../utils/distanceCalculator";
import Loader from '../../Garage-Interface/Components/Loader';

function Opennow() {
  const [garages, setGarages] = useState([]);
  const [error, setError] = useState(null);
  const userInfo = useSelector(selectUserInfo);
  const [isLoading, setIsLoading] = useState(false);

  const isGarageOpenNow = useCallback((operatingHours) => {
    if (!operatingHours) {
      console.log("No operating hours provided");
      return false;
    }

    const currentTime = new Date();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = daysOfWeek[currentTime.getDay()];
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    
    console.log("Checking hours for:", currentDay);
    console.log("Current time:", `${currentHour}:${currentMinute}`);
    
    const todayHours = operatingHours[currentDay];
    console.log("Today's hours:", todayHours);

    if (todayHours && todayHours.isOpen) {
      const [openHour, openMinute] = todayHours.openTime.split(':').map(Number);
      const [closeHour, closeMinute] = todayHours.closeTime.split(':').map(Number);

      console.log(`Opening time: ${openHour}:${openMinute}`);
      console.log(`Closing time: ${closeHour}:${closeMinute}`);

      const isOpen = (currentHour > openHour || (currentHour === openHour && currentMinute >= openMinute)) &&
                    (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute));
      
      console.log("Is garage open?", isOpen);
      return isOpen;
    }
    
    console.log("Garage is closed today");
    return false;
  }, []);

  const processedGarages = useMemo(() => {
    return garages
      .filter(garage => isGarageOpenNow(garage.operatingHours))
      .map(garage => ({
        ...garage,
        distance: calculateDistance(
          userInfo?.location?.lat,
          userInfo?.location?.lng,
          garage.garage_location?.lat,
          garage.garage_location?.lng
        )
      }))
      .sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
  }, [garages, userInfo, isGarageOpenNow]);

  useEffect(() => {
    const fetchGarages = async () => {
      if (!userInfo) return;
      
      setIsLoading(true);
      try {
        const garageList = await fetchAllGarages();
        const openGarages = garageList
          .filter(garage => isGarageOpenNow(garage.operatingHours))
          .map(garage => ({
            ...garage,
            distance: calculateDistance(
              userInfo.location?.lat,
              userInfo.location?.lng,
              garage.garage_location?.lat,
              garage.garage_location?.lng
            )
          }))
          .sort((a, b) => {
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
          });

        setGarages(openGarages);
      } catch (err) {
        console.error("Error fetching garages:", err);
        setError("Failed to fetch garages.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGarages();
  }, [userInfo]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      {error && <p className="error">{error}</p>}
      <div className="BrowseGarageContent">
        {userInfo ? (
          <div className="garage-list">
            {processedGarages.length === 0 ? (
              <p>No garages currently open.</p>
            ) : (
              processedGarages.map((garage, index) => (
                <div key={index} className="garage-item">
                  <div className="garage-info">
                    <div className="garage-image">
                      {garage.profileImageUrl ? (
                        <img 
                          src={garage.profileImageUrl} 
                          alt={`${garage.garage_name} profile`}
                          style={{ 
                            width: '80px', 
                            height: '80px', 
                            objectFit: 'cover', 
                            borderRadius: '10%',
                            background: 'transparent',
                            boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
                            backgroundSize: 'cover',
                          }}
                        />
                      ) : (
                        <div className="placeholder-image">No Image</div>
                      )}
                    </div>
                    <div>
                      <h3 className="garagename">{garage.garage_name}</h3>
                      <p className="status">Open Now</p>
                      <p className="distance">
                        Distance: {garage.distance.toFixed(2)} km
                      </p>
                    </div>
                  </div>
                  <div className="garage-actions">
                    <Link to={`/ViewGarageDetails/${garage.id}`}>
                      <button className="details-btn">View Garage details</button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <p>Please log in to view available garages.</p>
        )}
      </div>
    </div>
  );
}

export default Opennow;
