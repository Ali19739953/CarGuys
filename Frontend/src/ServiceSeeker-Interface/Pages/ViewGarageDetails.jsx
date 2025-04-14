import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, doc, getDoc, collection } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import HeaderSeeker from "../Components/NavBarSeeker";
import HeadericonsSeeker from "../Components/HeaderIconSeeker";
import NavBarMobile from "../Components/NavBarMobile";
import GarageViewMain from "../Components/GarageViewMain"
import { calculateDistance } from "../../utils/distanceCalculator";
import "./ViewGarageDetails.css"
import Loader from "../../Garage-Interface/Components/Loader";

const ViewGarageDetails = () => {
  const { garageId } = useParams();
  const [garage, setGarage] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [garageDetails, setGarageDetails] = useState(null);
  const [dataFetchAttempted, setDataFetchAttempted] = useState(false);

  useEffect(() => {
    const fetchUserAndGarageDetails = async () => {
      const db = getFirestore();
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        console.log("Logged in user's email:", user.email);
        try {
          // Fetch user location
          const userDoc = await getDoc(doc(db, "ServiceSeekers Users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserInfo({
              email: user.email,
              location: userData.location
            });
          }

          // Fetch garage details
          const garageUsersRef = doc(db, 'Garage Users', garageId);
          const garageUsersSnap = await getDoc(garageUsersRef);
          
          if (userDoc.exists() && garageUsersSnap.exists()) {
            const userData = userDoc.data();
            const garageUsersData = garageUsersSnap.data();
            
            console.log("User location:", userData.location);
            console.log("Garage location:", garageUsersData.garage_location);
            
            let distance = null;
            if (userData.location && garageUsersData.garage_location) {
              distance = calculateDistance(
                userData.location.lat,
                userData.location.lng,
                garageUsersData.garage_location.lat,
                garageUsersData.garage_location.lng
              );
              console.log("Calculated distance:", distance);
            } else {
              console.log("Unable to calculate distance. Missing location data.");
            }

            // Fetch all data from GarageDetails collection
            const garageDetailsRef = doc(collection(db, 'GarageDetails'), garageId);
            const garageDetailsSnap = await getDoc(garageDetailsRef);
            
            let garageDetailsData = null;
            if (garageDetailsSnap.exists()) {
              garageDetailsData = garageDetailsSnap.data();
              setGarageDetails(garageDetailsData);  // Store all garage details
            }

            const garageData = {
              id: garageId,
              garage_name: garageUsersData.garage_name,
              profileImageUrl: garageUsersData.profileImageUrl,
              garage_location: garageUsersData.garage_location,
              distance: distance,
              garage_email: garageUsersData.email,
              garage_phonenumber: garageUsersData.garage_phonenumber,
              // We don't need to include bannerImageUrl here as it's in garageDetails
            };

            console.log("Final garage data:", garageData);
            console.log("Garage details data:", garageDetailsData);
            setGarage(garageData);
          } else {
            console.log("User or garage data not found");
          }
        } catch (error) {
          console.error("Error fetching details:", error);
        }
      } else {
        console.log("No user logged in");
      }

      setDataFetchAttempted(true);
    };

    fetchUserAndGarageDetails();

    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [garageId]);

  if (!dataFetchAttempted) return <Loader />;

  return (
    <div className="ViewGarageDetailsContainer">
      {isMobile ? <NavBarMobile /> : <HeaderSeeker />}

      <main className="ViewGarageDetailsMain">
        <header className="ViewGarageDetailsHeader">
          <HeadericonsSeeker Title={"Garage Details"}/>
        </header> 
        {garage ? (
          <GarageViewMain 
            garage={garage} 
            userInfo={userInfo} 
            garageDetails={garageDetails}
          />
        ) : (
          <Loader />
        )}
      </main>
    </div>
  );
};

export default ViewGarageDetails;
