import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectUserInfo } from "../../Redux/Features/SharedSlices/Users/userSlice";
import AddCarForm from "../Components/AddCarForm";
import HeadericonsSeeker from "../Components/HeaderIconSeeker";
import NavBarMobile from "../Components/NavBarMobile";
import HeaderSeeker from "../Components/NavBarSeeker";
import { useNavigate } from "react-router-dom";
import "./AddVehicle.css";


const CarManagement = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const isLoggedIn = useSelector(selectIsAuthenticated);
  // const isLoggedIn = true; // Hardcoded for testing
  const userInfo = useSelector(selectUserInfo); 

  useEffect(() => {
    if (isLoggedIn && userInfo) {
      //added to debug the user info, to check if the user info is being fetched correctly
      console.log("User Info:", userInfo);
      console.log("User UID:", userInfo.user_id);
      console.log("User Name:", userInfo.email);
    }
  }, [isLoggedIn, userInfo]);

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleAddVehicleClick = () => {
    navigate("/AddVehicle");
  };

  return (
    <div className="car-management">
      {isLoggedIn ? (
        <div className="add-vehicle-container">
          {isMobile ? (
            //added role for testing
            <NavBarMobile role="navigation" />
          ) : (
            //added role for testing
            <HeaderSeeker role="navigation" />
          )}
          <main className="add-vehicle-main">
            <HeadericonsSeeker Title="Add Vehicle" />
            <div className="vehicle-section-header">
              <p className="WelcomeText">Select or Add a car...</p>
              <button className="add-car-btn" onClick={handleAddVehicleClick}>
                Add car
              </button>
            </div>
            <AddCarForm />
          </main>
        </div>
      ) : (
        <p>Please log in to manage your vehicles.</p>
      )}
    </div>
  );
};

export default CarManagement;