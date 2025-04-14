import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LocationPicker from "../../LocationPicker";
import "./SignupServiceSeeker.css";

function SignupServiceSeeker() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [location, setLocation] = useState({});
  const navigate = useNavigate();
  const checkPassword = () => {
    return password === confirmPassword;
  };

  const checkPasswordLength = () => {
    return password.length >= 8;
  };

  const checkPhoneNumberLength = () => {
    return contactNumber.length === 10;
  };

  const handleSignup = async (event) => {
    event.preventDefault();
//added extra check for email after testing
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address!");
      return;
    }

    if (!checkPasswordLength()) {
      alert("Password must be at least 8 characters long!");
      return;
    }

    if (!checkPassword()) {
      alert("Passwords do not match!");
      return;
    }

    if (!checkPhoneNumberLength()) {
      alert("Phone number must contain exactly 10 digits.");
      return;
    }
//added extra check for date of birth after testing
    const today = new Date();
    const birthDate = new Date(dob);
    if (birthDate > today) {
      alert("Date of birth cannot be in the future!");
      return;
    }

    const seekerdata = {
      email,
      password,
      firstName,
      lastName,
      dob,
      contactNumber,
      location,
      UserType: "ServiceSeeker",
    };

    try {
      const response = await fetch(
        "http://localhost:8000/service-seeker/signup/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(seekerdata),
        }
      );

      if (response.ok) {
        alert("Service seeker signup successful");
        alert("Please verify your email to continue");
        navigate("/Homepage");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An unexpected error occurred.");
    }
  };

  return (
    <div className="signup-container">
      <header className="signup-header">
        <div className="logo">
          <img src="/logologin.png" alt="Logo" />
        </div>
      </header>

      {/* Left side - Welcome message */}
      <div className="signup-welcome">
        <div className="welcome-text">
          <h1>
            Get Started with <span>CarGuys</span>
          </h1>
        </div>
      </div>

      {/* Right side - Signup form */}
      <div className="signup-form-container">
        <div className="signup-form">
          <h2>
            Register yourself at <span>CarGuys</span>
          </h2>
          {/* added role for testing */}
          <form onSubmit={handleSignup} role="form">
            <div className="form-group">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="Contact Number"
                required
              />
            </div>
            <div className="form-group">
              <input
                id="dob-picker"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                placeholder="Date of Birth"
                required
              />
            </div>
            <div className="form-group">
              <LocationPicker setLocation={setLocation} />
            </div>
            <button type="submit" className="signup-button">
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignupServiceSeeker;
