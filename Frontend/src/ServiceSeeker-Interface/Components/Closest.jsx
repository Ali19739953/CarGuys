//modified to use the redux store for user info-->for location
//modified to use the distance calculator function from utils
//modified to use the reverse geocoding function from api
//modified to use the fetch all garages function from api
import React, { useState, useEffect } from "react";
import { calculateDistance } from "../../utils/distanceCalculator";
import { useSelector } from 'react-redux';
import { selectUserInfo } from '../../Redux/Features/SharedSlices/Users/userSlice';
import { fetchAllGarages } from '../../api/garageUsers';
import { Link } from "react-router-dom";
import Loader from '../../Garage-Interface/Components/Loader';

function Closest() {
  const [garages, setGarages] = useState([]); 
  const [error, setError] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const userInfo = useSelector(selectUserInfo);

  useEffect(() => {
    const fetchGarages = async () => {
      setIsLoading(true);
      if (!userInfo || !userInfo.location) {
        console.log("User location not available."); 
        setIsLoading(false);
        return; 
      }

      const userLocation = {
        latitude: userInfo.location.lat,
        longitude: userInfo.location.lng,
      };

      try {
        const garageList = await fetchAllGarages();
        console.log("Fetched garages:", garageList);
//added for debugging
        const maxDistance = 40; // Maximum distance in km

        const garagesWithDistance = garageList.map(garage => {
          if (!garage.garage_location || !garage.garage_location.lat || !garage.garage_location.lng) {
            //added for debugging
            console.error(`Invalid location for garage: ${garage.garage_name}`);
            return { ...garage, distance: Infinity, locationError: "No valid location specified for the garage." };
          }
          //destructure the location from the garage object
          const { lat, lng } = garage.garage_location; 
          try {
            const distance = calculateDistance(userLocation.latitude, userLocation.longitude, lat, lng);
            console.log(`Distance from User (${userLocation.latitude}, ${userLocation.longitude}) to Garage ${garage.garage_name} (${lat}, ${lng}):`, distance);
            return { ...garage, distance }; 
          } catch (error) {
            console.error(`Error calculating distance for garage ${garage.garage_name}:`, error);
            return { ...garage, distance: Infinity, locationError: "Error calculating distance." };
          }
        });
        //To filter out garages with no location specified and garages closer to the user based on the max distance variable.
        const filteredGarages = garagesWithDistance
          .filter(garage => garage.distance <= maxDistance && !garage.locationError)
          //sort the garages by distance in ascending order
          .sort((a, b) => a.distance - b.distance);

        setGarages(filteredGarages); 
      } catch (err) {
        console.error("Error fetching garages:", err); 
        setError("Failed to fetch garages."); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchGarages(); 
  }, [userInfo]); 

  return (
    <div>
      {error && <p className="error">{error}</p>}
      <div className="BrowseGarageContent">
        {userInfo ? (
          <div className="garage-list">
            {isLoading ? (
              <Loader />
            ) : garages.length === 0 ? (
              <p>No garages available.</p>
            ) : (
              garages.map((garage, index) => (
                <div key={index} className="garage-item">
                   <div className="garage-info">
                    <div className="garage-image">
                      {garage.profileImageUrl ? (
                        <img 
                          src={garage.profileImageUrl} 
                          alt={`${garage.garage_name} profile`}
                          //added styles here since the styles were not being applied in the BrowseGarageComponent due to global styles(not my fault)
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
                        <div 
                          className="placeholder-image"
                           //added styles here since the styles were not being applied in the BrowseGarageComponent due to global styles(not my fault)
                          style={{ 
                            width: '80px', 
                            height: '80px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            backgroundColor: 'transparent',
                            borderRadius: '10%',
                            background: 'transparent',
                            boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
                            backgroundSize: 'cover',
                          }}
                        >
                          No Image
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="garagename">{garage.garage_name}</h3>
                      {garage.locationError ? (
                        <p className="error">{garage.locationError}</p>
                      ) : (
                        <>
                          <div className="rating">
                          </div>
                          <p className="status">{garage.status}</p>
                          <p className="distance">
                            {/* garages with no location specified will not be displayed */}
                          {garage.distance != null ? `Distance: ${garage.distance.toFixed(2)} km` : 'No Location Specified'}
                          </p>
                        </>
                      )}
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

export default Closest;
