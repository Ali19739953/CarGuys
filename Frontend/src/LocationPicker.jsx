//file to get the user's location
import React, { useState } from "react";

function LocationPicker({ setLocation }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getUserLocation = () => {
    setLoading(true);
    setError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLoading(false);
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
        },
        (error) => {
          setLoading(false);
          setError(error.message);
          console.error("Error getting location:", error);
        }
      );
    } else {
      setLoading(false);
      setError("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="location-picker">
      <button onClick={getUserLocation} disabled={loading}>
        {loading ? "Getting location..." : "Get My Location"}
      </button>
      {error && <p>Error: {error}</p>}
    </div>
  );
}

export default LocationPicker;
