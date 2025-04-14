import React from "react";
import "./GarageProfile.css";
import { useNavigate, Link } from "react-router-dom";

function GarageProfile() {
  return (
    <div className="Profile">
      <header className="profile-header">
        <div className="logo">
          <h1>Profile</h1>
        </div>
      </header>
      <main className="main-content">
        <h3>
          <pre>Modify your Garage </pre>
        </h3>
      </main>
    </div>
  );
}

export default GarageProfile;
