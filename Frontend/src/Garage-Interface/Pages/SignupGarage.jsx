import React from "react";
import { useState, useEffect, useRef } from "react";
import LocationPicker from "../../LocationPicker";
import { useNavigate } from "react-router-dom";
import "./SignupGarage.css";

function SignupGarage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [garageName, setgarageName] = useState("");
  const [garagephonenumber, setGaragephonenumber] = useState("");
  const [garagelicense, setGaragelicense] = useState("");
  const [image, setImage] = useState(null);
  const [garageLocation, setGarageLocation] = useState(null);
  const alertDisplayed = useRef(false);

  useEffect(() => {
    if (!alertDisplayed.current) {
      alert("This is only for Garage Managers!");
      alertDisplayed.current = true;
    }
  }, []);

  const checkPassword = () => {
    return password === confirmpassword;
  };
  const navigate = useNavigate();
  const checkPasswordLength = () => {
    return password.length >= 8;
  };

  const checkPhoneNumberLength = () => {
    return garagephonenumber.length === 10;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the default form submission

    if (!checkPasswordLength()) {
      alert("Password must be at least 8 characters long!");
      return; // If password is too short, stop submission
    }

    if (!checkPassword()) {
      alert("Passwords do not match!");
      return; //check if password match, if not return
    }

    if (!checkPhoneNumberLength()) {
      alert("Phone number must contain exactly 10 digits.");
      return; // Stop submission if phone number is invalid
    }

    const actionCodeSettings = {
      url: "http://localhost:5173/", // Redirect URL after the user clicks the link
      handleCodeInApp: true, // Indicates this link is to be opened in the app
    };

    const data = {
      email,
      password,
      confirmpassword,
      garageName,
      garagephonenumber,
      garageLocation,
      UserType: "GarageManagers", //manually added the usertype here
    };

    try {
      const response = await fetch(
        "http://localhost:8000/auth/garage-signup/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Ensure JSON content type
          },
          body: JSON.stringify(data), // Convert data to JSON string
        }
      );

      if (response.ok) {
        alert("Garage signup successful");
        alert("Please verify your email to continue");
        navigate("/Homepage");
      } else {
        alert("Email already in use. Please log in or try a different email.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An unexpected error occurred.");
    }
  };

  return (
    <div className="garage-signup-container">
      {/* Left side - Welcome message */}
      <div className="garage-signup-welcome">
        <div className="welcome-text">
          <h1>
            Partner up with <span>CarGuys</span> Today !!
          </h1>
        </div>
      </div>

      {/* Right side - Signup form */}
      <div className="garage-signup-form-container">
        <div className="garage-signup-form">
          <h2>
            Register yourself at <span>CarGuys</span>
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                value={email}
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                value={password}
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                value={confirmpassword}
                placeholder="Confirm Password"
                onChange={(e) => setConfirmpassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                value={garageName}
                placeholder="Garage Name"
                onChange={(e) => setgarageName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="tel"
                value={garagephonenumber}
                placeholder="Contact Number"
                onChange={(e) => setGaragephonenumber(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <LocationPicker setLocation={setGarageLocation} />
            </div>
            <button type="submit" className="signup-button">
              Sign up with email
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignupGarage;
