import React from "react";
import "./GarageSettings.css";
import GarageNavbar from "../Components/GarageNavbar";
import { useSelector } from 'react-redux';
import { selectUserInfo } from '../../Redux/Features/SharedSlices/Users/userSlice';
import { useNavigate } from 'react-router-dom';

function GarageSettings() {
  const userInfo = useSelector(selectUserInfo);
  const navigate = useNavigate();
  function changepassword() {
    navigate('/ForgotPassword')
  }
  
  function handleEditProfile() {
    navigate('/ManageGarageDetails');
  }
  
  function gallery() {}
  
  return (
    <div className="garage-settings-container">
      <GarageNavbar />
      <div className="garage-settings-main">
        <div className="garage-settings-content">
          <h1 className="garage-settings-title">Settings</h1>
          
          <div className="settings-row">
            <p className="settings-text">Access Email: {userInfo?.email || 'No email available'}</p>
           
          </div>

          <div className="settings-row">
            <p className="settings-text">Garage Name: {userInfo?.garage_name || 'No name available'}</p>
          </div>
          <div>
          </div>
          <div>
            <p>Garage Phone Number: {userInfo?.garage_phonenumber || 'No phone number available'}</p>
          </div>
          <div>
            <p>User Type: {userInfo?.user_type}</p>
          </div>
          <button className="change-password-btn" onClick={handleEditProfile}>Edit Profile</button>
          <button className="change-password-btn" onClick={changepassword}>
            Change Password
          </button>
          
          <div className="settings-row">
            {/* <button className="edit-gallery-btn" onClick={gallery}>
              Edit Gallery
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GarageSettings;
