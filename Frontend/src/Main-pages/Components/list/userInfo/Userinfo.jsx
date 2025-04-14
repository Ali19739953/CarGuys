import { useState, useEffect } from "react";
// imported reverseGeocode function made by ali
import reverseGeocode from "../../../../api/reverseGeocode.js"; 
import styles from "./userInfo.module.css";
import { useUserStore } from "../../../lib/userStore";
import { auth } from "@/firebaseConfig";

const Userinfo = () => {
  const { currentUser } = useUserStore();
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (currentUser) {
      let lat, lng;

      
      if (currentUser.user_type === "GarageManagers" && currentUser.garage_location) {
        lat = currentUser.garage_location.lat;
        lng = currentUser.garage_location.lng;
      } else if (currentUser.user_type === "ServiceSeeker" && currentUser.location) {
        lat = currentUser.location.lat;
        lng = currentUser.location.lng;
      }

      // Fetch location if lat and lng are found
      if (lat && lng) {
        const fetchLocation = async () => {
          try {
            const result = await reverseGeocode(lat, lng);
            setLocation(result); 
          } catch (error) {
            console.error("Error fetching location:", error);
          }
        };

        fetchLocation();
      }
    }
  }, [currentUser]);

  return (
    <div className={styles.cmCurrentUserInfo}>
      <div className={styles.cmCurrentuser}>
        {currentUser ? (
          currentUser.user_type === "GarageManagers" ? (
            <img
              src={currentUser?.avatar ? currentUser.avatar : "/avatar.png"}
              alt="PFP"
            />
          ) : (
            <img
              src={currentUser?.avatar ? currentUser.avatar : "/avatar.png"}
              alt="PFP"
            />
          )
        ) : (
          <div>Loading user data...</div>
        )}
        <div className={styles.cmCurrentuserheader}>
          {/* Rendering userinfo based on user_type of currently authenticated user */}
          {currentUser ? (
            currentUser.user_type === "ServiceSeeker" ? (
              <h2>{(currentUser.first_name + " " + currentUser.last_name).trim()}</h2>
            ) : (
              <h2>{currentUser.garage_name}</h2>
            )
          ) : (
            <div>Loading user data...</div>
          )}

         
          <p>
            {location ? `${location}` : "Location not avaliable"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Userinfo;
