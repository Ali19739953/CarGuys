import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  selectIsAuthenticated,
  selectUserInfo,
  setUserAuthenticated,
} from "../../Redux/Features/SharedSlices/Users/userSlice";
import { auth, firestore, storage } from "../../firebaseConfig";
import HeaderSeeker from "../Components/NavBarSeeker";
import SearchBarServiceSeeker from "../Components/VehicleSelectBarServiceSeeker";
import HeadericonsSeeker from "../Components/HeaderIconSeeker";
import NavBarMobile from "../Components/NavBarMobile";
import "./CarManagement.css";
import EditVehicle from "../Components/EditVehicle";
import VehicleServiceHistory from "../Components/VehicleServiceHistory";

function CarManagement() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const isLoggedIn = useSelector(selectIsAuthenticated);
  const userInfo = useSelector(selectUserInfo);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVehicleHistory, setSelectedVehicleHistory] = useState(null);
  const [selectedSearchVehicle, setSelectedSearchVehicle] = useState(null);
  const [showServiceHistory, setShowServiceHistory] = useState(false);

  const showallvehicles = () => {
    setSelectedSearchVehicle(null);
  }

  const fetchVehicles = useCallback(async () => {
    if (isLoggedIn && userInfo) {
      const userId = userInfo.user_id || userInfo.uid;
      if (!userId) {
        console.error("User ID not found in userInfo");
        return;
      }
      console.log("Fetching vehicles for user:", userId);
      try {
        const vehiclesSnapshot = await firestore
          .collection("Vehicle Management")
          .doc(userId)
          .collection("vehicles")
          .get();

        const vehiclesData = vehiclesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Fetched vehicles:", vehiclesData);
        setVehicles(vehiclesData);
      } catch (error) {
        console.error("Error fetching vehicles data:", error);
      }
    }
  }, [isLoggedIn, userInfo]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        dispatch(setUserAuthenticated(true));
        console.log("User is logged in", user.email);
      } else {
        dispatch(setUserAuthenticated(false));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSave = () => {
    setIsEditing(false);
    setSelectedVehicle(null);
    fetchVehicles();
  };

  const handleDelete = async (vehicle) => {
    setSelectedVehicle(null);
    setIsEditing(false);
    if (!userInfo || !userInfo.user_id) {
      alert("User information is missing. Please log in again.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      try {
        await firestore
          .collection("Vehicle Management")
          .doc(userInfo.user_id)
          .collection("vehicles")
          .doc(vehicle.id)
          .delete();
        if (vehicle.imageUrl) {
          const imageRef = storage.refFromURL(vehicle.imageUrl);
          await imageRef.delete();
        }

        alert("Vehicle deleted successfully!");
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        alert("Failed to delete vehicle. Please try again.");
      }
    }

    fetchVehicles();
  };

  const handleAddVehicleClick = () => {
    navigate("/AddVehicle");
  };

  const handleEditVehicleClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsEditing(true);
  };

  const fetchVehicleServiceHistory = async (vehicleId) => {
    if (!userInfo?.user_id) return;
    
    try {
      const bookingsSnapshot = await firestore
        .collection("Bookings")
        .where("userId", "==", userInfo.user_id)
        .where("selectedVehicle.id", "==", vehicleId)
        .get();

      const serviceHistory = bookingsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          bookingId: doc.id,
          date: data.selectedDate,
          time: data.selectedTime,
          services: data.selectedServices,
          status: data.isCompleted ? 'completed' : data.isOngoing ? 'ongoing' : 'pending',
          paymentMethod: data.selectedPayment,
          price: data.price,
          deliveryDate: data.deliveryDate
        };
      });

      return serviceHistory;
    } catch (error) {
      console.error("Error fetching vehicle service history:", error);
      return [];
    }
  };

  const handleVehicleClick = (car) => {
    setSelectedVehicle(car);
  };

  const handleShowServiceHistory = async () => {
    if (!selectedVehicle) return;
    
    const serviceHistory = await fetchVehicleServiceHistory(selectedVehicle.id);
    setSelectedVehicleHistory({
      ...selectedVehicle,
      serviceHistory
    });
    setShowServiceHistory(true);
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedSearchVehicle(vehicle);
  };

  const handleShowAllVehicles = () => {
    setSelectedSearchVehicle(null);
  };

  return (
    <div className="Car-Container">
      {isMobile ? <NavBarMobile /> : <HeaderSeeker />}
      <main className="Car-Main">
        <header className="BrowseGarageHeader">
          <HeadericonsSeeker Title={"Car Management"} />
        </header>
        <SearchBarServiceSeeker onVehicleSelect={handleVehicleSelect} />

        <div className="vehicle-section">
          <div className="vehicle-section-header">
            <p className="WelcomeText">Select or Add a car...</p>
            <div className="vehicle-buttons" style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '20px'
            }}>
              <button 
                className="show-all-btn" 
                onClick={handleShowAllVehicles}
                style={{
                  display: 'flex',
                  width: '150px',
                  height: '28px',
                  padding: '8px 20px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  flexShrink: '0',
                  borderRadius: '20px',
                  background: 'linear-gradient(180deg, #FFA500 0%, rgba(180, 117, 0, 0.80) 100%)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  border: 'none',
                  color: 'black'
                }}
              >
                Show All Vehicles
              </button>
              <button 
                className="add-car-btn" 
                onClick={handleAddVehicleClick}
                style={{
                  display: 'flex',
                 
                  height: '28px',
                  padding: '8px 20px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 'px',
                  flexShrink: '0',
                  borderRadius: '20px',
                  background: 'linear-gradient(180deg, #FFA500 0%, rgba(180, 117, 0, 0.80) 100%)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  border: 'none',
                  color: 'black'
                }}
              >
                Add car
              </button>
            </div>
          </div>
          <div className="car-card-container">
            {(selectedSearchVehicle ? vehicles.filter(car => car.id === selectedSearchVehicle.id) : vehicles).map((car) => (
              <div 
                className="car-card" 
                key={car.id}
                onClick={() => handleVehicleClick(car)}
                style={{ cursor: 'pointer' }}
              >
                <div className="car-header">
                  <div className="car-details">
                    <p>Vechicle Id: {car.id}</p>
                    <p>Make: {car.make}</p>
                    <p>Model: {car.model}</p>
                    <p>Year: {car.year}</p>
                    <p>Number Plate: {car.numberPlate}</p>
                  </div>
                  <img
                    src={car.imageUrl}
                    alt={`${car.make} ${car.model}`}
                    className="car-image"
                  />
                </div>
                <div className="card-actions" style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '15px'
                }}>
                  <button
                    className="edit-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditVehicleClick(car);
                    }}
                    style={{
                      display: 'flex',
                      width: '100px',
                      height: '28px',
                      padding: '8px 20px',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '10px',
                      flexShrink: '0',
                      borderRadius: '20px',
                      background: 'linear-gradient(180deg, #FFA500 0%, rgba(180, 117, 0, 0.80) 100%)',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      border: 'none',
                      color: 'black'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(car);
                    }}
                    style={{
                      display: 'flex',
                      width: '100px',
                      height: '28px',
                      padding: '8px 20px',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '10px',
                      flexShrink: '0',
                      borderRadius: '20px',
                      background: 'linear-gradient(180deg, #FF5151 0%, #993131 100%)', // Red gradient for delete
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      border: 'none',
                      color: 'black'
                    }}
                  >
                    Delete
                  </button>
                  {selectedVehicle?.id === car.id && (
                    <button
                      className="history-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowServiceHistory();
                      }}
                      style={{
                        display: 'flex',
                        width: '187px',
                        height: '28px',
                        padding: '8px 20px',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px',
                        flexShrink: '0',
                        borderRadius: '20px',
                        background: 'linear-gradient(180deg, #FFA500 0%, rgba(180, 117, 0, 0.80) 100%)',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        border: 'none',
                        color: 'black'
                      }}
                    >
                      Show Service History
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {showServiceHistory && selectedVehicleHistory && (
          <VehicleServiceHistory
            vehicle={selectedVehicleHistory}
            onClose={() => {
              setShowServiceHistory(false);
              setSelectedVehicleHistory(null);
            }}
          />
        )}

        <EditVehicle
          isOpen={isEditing}
          onClose={() => {
            setIsEditing(false);
            setSelectedVehicle(null);
          }}
          onSave={handleSave}
          //onDelete={handleDelete}
          vehicle={selectedVehicle}
        />
      </main>
    </div>
  );
}

export default CarManagement;