import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { firestore } from "../../firebaseConfig"; 
import styles from "../Modules/Vehicleselectbarseeker.module.css";
import { selectIsAuthenticated, selectUserInfo } from '../../Redux/Features/SharedSlices/Users/userSlice';
import { setVehicles, setSelectedVehicle, selectVehicles, selectSelectedVehicle } from '../../Redux/Features/SharedSlices/Vehicles/vehicleSlice';
import { useNavigate } from 'react-router-dom';
const VehicleSelectBarServiceSeeker = ({ onVehicleSelect }) => {
  const [loading, setLoading] = useState(true);
  
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userInfo = useSelector(selectUserInfo);
  const vehicles = useSelector(selectVehicles);
  const selectedVehicle = useSelector(selectSelectedVehicle);
  const navigate = useNavigate();
  const fetchVehicles = useCallback(async () => {
    if (isAuthenticated && userInfo) {
      setLoading(true);
      const userId = userInfo.user_id || userInfo.uid;
      if (!userId) {
        console.error("User ID not found in userInfo");
        setLoading(false);
        return;
      }
      try {
        const vehiclesSnapshot = await firestore
          .collection("Vehicle Management")
          .doc(userId)
          .collection("vehicles")
          .get();
//fixed this as well
        const vehicleList = vehiclesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            make: data.make,
            model: data.model,
            year: data.year,
            numberPlate: data.numberPlate,
            imageUrl: data.imageUrl || data.vehicleImage,
            ...data
          };
        });
        
        console.log('Fetched vehicles with images:', vehicleList);
        
        dispatch(setVehicles(vehicleList));
        if (vehicleList.length > 0 && !selectedVehicle) {
          dispatch(setSelectedVehicle(vehicleList[0]));
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, userInfo, dispatch, selectedVehicle]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleVehicleChange = (event) => {
    const selectedVehicleId = event.target.value;
    const vehicle = vehicles.find(v => v.id === selectedVehicleId);
    const userId = userInfo?.user_id || userInfo?.uid;

    if (vehicle) {
      const selectedVehicleData = {
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        numberPlate: vehicle.numberPlate,
        imageUrl: vehicle.imageUrl || vehicle.vehicleImage,
        userId: userId,
        vehicleId: vehicle.id,
        user_id: userId
      };
      
      dispatch(setSelectedVehicle(selectedVehicleData));
      if (onVehicleSelect) {
        onVehicleSelect(selectedVehicleData);
      }
    }
  };

  if (!isAuthenticated) {
    return <div>Please log in to view your vehicles.</div>;
  }

  if (loading) {
    return <div>Loading vehicles...</div>;
  }
//fixed this as well,added more conditions and checks
  if (vehicles.length === 0 && !isAuthenticated) {
    return (
      <div className={styles.noVehiclesMessage}>
        Please log in to select a vehicle.
        <button onClick={() => navigate('/Addvehicle')}>Add Vehicle</button>
      </div>
    );
  }
  else if (vehicles.length === 0 && isAuthenticated) {
    return (
      <div className={styles.noVehiclesMessage}>
        Please add a vehicle before proceeding to send a service request.
        <button onClick={() => navigate('/Addvehicle')}>Add Vehicle</button>
      </div>
    );
  }

  return (
    <div className={styles.searchbarcontainer}>
      <select 
        className={styles.searchbar}
        value={selectedVehicle ? selectedVehicle.id : ""}
        onChange={handleVehicleChange}
      >
        <option value="" disabled>
          Select User Car...
        </option>
        {vehicles.map((vehicle) => (
          <option key={vehicle.id} value={vehicle.id}>
            {vehicle.make} {vehicle.model} ({vehicle.year}) - {vehicle.numberPlate}
          </option>
        ))}
      </select>
      <span className={styles.dropdownarrow}></span>
    </div>
  );
};

export default VehicleSelectBarServiceSeeker;
