//modified to use the redux store for user info-->for location
//modified to use the reverse geocoding function from api

import React, { useState, useEffect } from "react";
import "../Pages/BrowseGarage.css";
import Ratings from "./Ratings";
import Opennow from "./Opennow";
import Closest from "./Closest";
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../Redux/Features/SharedSlices/Users/userSlice';
import { selectUserInfo } from '../../Redux/Features/SharedSlices/Users/userSlice';
import reverseGeocode from '../../api/reverseGeocode';

function BrowseGarageComponent() {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const [userLocation, setUserLocation] = useState(null);
    const [sortValue, setSortValue] = useState("Closest");
    const [locationDescription, setLocationDescription] = useState("");
    const userInfo = useSelector(selectUserInfo);
    console.log("User Infoheheh:", userInfo);
    console.log("Is Authenticated:", isAuthenticated);
    useEffect(() => {
        if (isAuthenticated) {
            setUserLocation(userInfo.location);
        }
    }, [isAuthenticated, userInfo]);
    console.log("User Location:", userLocation);
    useEffect(() => {
        if (userLocation?.lat && userLocation?.lng) {
            reverseGeocode(userLocation.lat, userLocation.lng).then(address => {
                setLocationDescription(address);
            });
        }
    }, [userLocation]);
    // useEffect(() => {
    //     const fetchUserLocation = async () => {
    //         const auth = getAuth();
    //         const user = auth.currentUser;

    //         if (user) {
    //             try {
    //                 const db = getFirestore();
    //                 const userDoc = await getDoc(doc(db, "ServiceSeekers Users", user.uid));

    //                 if (userDoc.exists()) {
    //                     const userData = userDoc.data();
    //                     if (userData.location) {
    //                         setUserLocation(userData.location);
    //                         await fetchAddress(userData.location.lat, userData.location.lng);
    //                     } else {
    //                         setLocationDescription("User location not found in the database.");
    //                     }
    //                 } else {
    //                     setLocationDescription("User document not found in the database.");
    //                 }
    //             } catch (err) {
    //                 console.error("Error fetching user location:", err);
    //                 setLocationDescription("Failed to fetch user location.");
    //             }
    //         } else {
    //             setLocationDescription("User not authenticated.");
    //         }
    //     };

    //     fetchUserLocation();
    // }, []);

    // const fetchAddress = async (lat, lng) => {
    //     try {
    //         const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    //         const data = await response.json();
    //         if (data && data.display_name) {
    //             setLocationDescription(data.display_name);
    //         } else {
    //             setLocationDescription("Location not found");
    //         }
    //     } catch (error) {
    //         console.error("Error fetching address: ", error);
    //         setLocationDescription("Error fetching location");
    //     }
    // };

    // const handleChangeLocation = () => {
    //     const newLocation = prompt("Enter your new location:");
    //     if (newLocation) {
    //         setUserLocation(newLocation);
    //     }
    // };
//passed userlocation to the components
    const renderSection = () => {
        switch (sortValue) {
            // case 'Least Busy':
            //     return <Leastbuy userLocation={userLocation} />;
            // case 'Popularity':
            //     return <Popularity userLocation={userLocation} />;
            case 'Rating':
                return <Ratings userLocation={userLocation} />;
            case 'Opennow':
                return <Opennow userLocation={userLocation} />;
            case 'Closest':
                return <Closest userLocation={userLocation} />;
            default:
                return null;
        }
    };

    return (
        <div className="browse-garage-container">
            <div className="BrowseGarageSortBar">
                <span className="BrowseGarageSortBar_SortBy">SORT BY: </span>
                {["Closest", "Rating", "Opennow"].map((value) => (
                    <button
                        key={value}
                        className={`BrowseGarageSortBar_SortButton ${sortValue === value ? 'active' : ''}`}
                        onClick={() => setSortValue(value)}
                    >
                        {value}
                    </button>
                ))}
            </div>
            <div className="BrowseGarageLocation">
                <p className="BrowseGarage_UserCurrentLocation">
                    {locationDescription || "Current location not set"}
                </p>
                {/* <button className="BrowseGarageLocation_ChangeLocationButton" onClick={handleChangeLocation}>
                    Change Location
                </button> */}
            </div>
            
            <section className="BrowseGarage_Content">
                {renderSection()}
            </section>
        </div>
    );
}

export default BrowseGarageComponent;
