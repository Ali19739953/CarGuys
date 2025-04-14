// all the imports here
//not properly implemented still in testing phase but all the functionality is working!!!!!!!
import GarageNavbar from "../Components/GarageNavbar";
import BankDetails from "../Components/Bankdetails";
import "./ManageGarageDetails.css";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Mobileheader from "../Components/Mobileheader";
import Headericons from "../Components/Headericons";
import { auth,firestore,storage } from "../../firebaseConfig"
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import Loader from "../Components/Loader";

// import for the map api
import L from "leaflet";
//added functionality to save the location,change the location.
//still email change is not implemented.
import LocationPicker from "../../LocationPicker";
import reverseGeocode from '../../api/reverseGeocode';

const ManageGarageDetails = () => {
  // states
 
 
  const [emailAddress, setEmailAddress] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [GarageName, setGarageName] = useState(null);
  const [GarageDescription, setGarageDescription] = useState(""); // Initialize as an empty string
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [map, setMap] = useState(null); // State to store the map instance
  const [operatingHours, setOperatingHours] = useState({
    Monday: { isOpen: false, openTime: null, closeTime: null },
    Tuesday: { isOpen: false, openTime: null, closeTime: null },
    Wednesday: { isOpen: false, openTime: null, closeTime: null },
    Thursday: { isOpen: false, openTime: null, closeTime: null },
    Friday: { isOpen: false, openTime: null, closeTime: null },
    Saturday: { isOpen: false, openTime: null, closeTime: null },
    Sunday: { isOpen: false, openTime: null, closeTime: null },
  });
  const [servicesOfferedArr, setServicesOfferedArr] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [garageDetails, setGarageDetails] = useState(null); // State to store fetched garage details
  const [locationDescription, setLocationDescription] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [bannerImageUrl, setBannerImageUrl] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const bannerInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState({
    VISA: false,
    COD: false
  });

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const [garageData, setGarageData] = useState(null); // State to store fetched garage data
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
//use the states to maanage evverthing.

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log("User is logged in:", user.uid);
        setIsLoading(true); // Start loading
        try {
          // Fetch data from Firestore
          const garageRef = firestore.collection("Garage Users").doc(user.uid);
          const doc = await garageRef.get();
          if (doc.exists) {
            setGarageData(doc.data());
            setProfileImageUrl(doc.data().profileImageUrl);

            // Fetch garage details from GarageDetails collection
            const detailsRef = firestore.collection("GarageDetails").doc(user.uid);
            const detailsDoc = await detailsRef.get();
            if (detailsDoc.exists) {
              setGarageDetails(detailsDoc.data());
              setGarageDescription(detailsDoc.data().description || GarageDescription);
              
             
              const fetchedHours = detailsDoc.data().operatingHours || {};
              const updatedHours = {...operatingHours};
              
              Object.keys(updatedHours).forEach(day => {
                if (typeof fetchedHours[day] === 'boolean') {
                  updatedHours[day] = { isOpen: fetchedHours[day], openTime: '09:00', closeTime: '17:00' };
                } else if (fetchedHours[day]) {
                  updatedHours[day] = fetchedHours[day];
                }
              });
              
              setOperatingHours(updatedHours);
              setBannerImageUrl(detailsDoc.data().bannerImageUrl || bannerImageUrl);
              const services = detailsDoc.data().services || [];
              setServicesOfferedArr(services);
              setSelectedServices(services);

              // Set payment methods from Firestore, only 2
              const fetchedPaymentMethods = detailsDoc.data().paymentMethods || [];
              const updatedPaymentMethods = {
                VISA: fetchedPaymentMethods.includes('VISA'),
                COD: fetchedPaymentMethods.includes('COD')
              };
              setPaymentMethods(updatedPaymentMethods);
            } else {
              console.log("No garage details document found!");
            }
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false); // Stop loading
        }
      } else {
        console.log("No user is signed in.");
        setIsLoading(false); // Stop loading
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  
  useEffect(() => {
    if (garageData) {
      setGarageName(garageData.garage_name || GarageName);
      setEmailAddress(garageData.email || emailAddress);
      setPhoneNumber(garageData.garage_phonenumber || phoneNumber);
      
      // Ensure GARAGE_COORDINATES is set only if garageData is available
      if (garageData.garage_location) {
        const GARAGE_COORDINATES = garageData.garage_location;
        
      }
    }
  }, [garageData]);

  //error check, if coordinates are not available, use default coordinates.
  const GARAGE_COORDINATES = useMemo(() => 
    garageData?.garage_location || null,
    [garageData]
  );

  // Function to fetch address based on coordinates
  //will use reverse geocoding to fetch the address.
  const fetchAddress = async (lat, lng) => {
    try {
      const address = await reverseGeocode(lat, lng);
      setLocationDescription(address);
    } catch (error) {
      console.error("Error fetching address: ", error);
      setLocationDescription("Error fetching location");
    }
  };

  // Create a memoized function for setting up the map
  const setupMap = useCallback(() => {
    if (garageData && garageData.garage_location) {
      // Fetch address when coordinates are available
      fetchAddress(GARAGE_COORDINATES.lat, GARAGE_COORDINATES.lng);

      if (!mapInstanceRef.current && mapRef.current) {
        mapInstanceRef.current = L.map(mapRef.current).setView(
          [GARAGE_COORDINATES.lat, GARAGE_COORDINATES.lng],
          12
        );

        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
          {
            maxZoom: 20,
            attribution:
              '&copy; <a href="https://www.esri.com/en-us/home">Esri</a> contributors',
          }
        ).addTo(mapInstanceRef.current);

        L.marker([GARAGE_COORDINATES.lat, GARAGE_COORDINATES.lng])
          .addTo(mapInstanceRef.current)
          .bindPopup(garageData.garage_name)
          .openPopup();
      } else if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([GARAGE_COORDINATES.lat, GARAGE_COORDINATES.lng], 12);
        L.marker([GARAGE_COORDINATES.lat, GARAGE_COORDINATES.lng])
          .addTo(mapInstanceRef.current)
          .bindPopup(garageData.garage_name)
          .openPopup();
      }
    }
  }, [garageData, GARAGE_COORDINATES]);

  // Modify the useEffect that sets up the map
  useEffect(() => {
    if (!isLoading && garageData) {
      setupMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [setupMap, isLoading, garageData]);

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  const addPayment = () => {
    alert("Payment Method saved!");
  };

  const handleLocationUpdate = () => {
    if (!mapInstanceRef.current) return;

    // Enable click event on map
    mapInstanceRef.current.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      
      try {
        const userId = auth.currentUser.uid;
        
        // Update location in Firestore
        await firestore.collection("Garage Users").doc(userId).update({
          garage_location: {
            lat: lat,
            lng: lng
          }
          
        }
        

      );

        // Update marker position
        mapInstanceRef.current.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            mapInstanceRef.current.removeLayer(layer);
          }
        });

        L.marker([lat, lng])
          .addTo(mapInstanceRef.current)
          .bindPopup(GarageName)
          .openPopup();

        // Fetch and update address description
        await fetchAddress(lat, lng);
        
        alert("Location updated successfully!");
      } catch (error) {
        console.error("Error updating location:", error);
        alert("Failed to update location. Please try again.");
      }
    });
  };

  const saveLocation = () => {
    if (mapInstanceRef.current) {
      alert("Click on the map to select your new location");
      handleLocationUpdate();
    }
  };

  const addManual = () => {
    let addedService = prompt("Name of the service you want to add.");
    if (addedService && addedService.trim()) {
      if (servicesOfferedArr.includes(addedService)) {
        alert("This service is already offered.");
      } else {
        setServicesOfferedArr(prevServices => [...prevServices, addedService]);
        setSelectedServices(prevSelected => [...prevSelected, addedService]);
      }
      alert("Service added successfully!");
    }
  };
//function to toggle the operating hours.
  const toggleOperating = (day) => {
    setOperatingHours((prevState) => ({
      ...prevState,
      [day]: { 
        isOpen: !prevState[day].isOpen,
        openTime: !prevState[day].isOpen ? prevState[day].openTime : null,
        closeTime: !prevState[day].isOpen ? prevState[day].closeTime : null
      },
    }));
  };

  const handleTimeChange = (day, field, value) => {
    setOperatingHours((prevState) => ({
      ...prevState,
      [day]: { ...prevState[day], [field]: value },
    }));
  };

//function to edit the description.
  function editDescription() {
    const newGarageDescription = prompt(
      "Please enter the description:",
      GarageDescription
    );
    if (newGarageDescription) {
      setGarageDescription(newGarageDescription);
    }
  }
//function to save the garage details in teh garageDetails collection
  function saveGarageDetails() {
    if (GarageDescription && GarageName) {
      const userId = auth.currentUser.uid;
      console.log("Saving details for user:", userId);

      // Create the cleanedOperatingHours object
      const cleanedOperatingHours = Object.entries(operatingHours).reduce((acc, [day, hours]) => {
        acc[day] = {
          isOpen: hours.isOpen,
          openTime: hours.isOpen ? hours.openTime : null,
          closeTime: hours.isOpen ? hours.closeTime : null
        };
        return acc;
      }, {});

      const garageDetailsRef = firestore.collection("GarageDetails").doc(userId);

      garageDetailsRef.get()
        .then((doc) => {
          if (doc.exists) {
            console.log("Existing document found. Updating...");
          } else {
            console.log("No existing document. Creating new one...");
          }

          return garageDetailsRef.set({
            description: GarageDescription,
            operatingHours: cleanedOperatingHours,
          }, { merge: true });
        })
        .then(() => {
          console.log("Document successfully updated/created");
          alert("Details saved successfully!");
        })
        .catch((error) => {
          console.error("Error checking/saving document: ", error);
          alert("Error saving details. Please try again.");
        });

      // Save name and email to Garage Users collection
      firestore.collection("Garage Users").doc(userId).set({
          garage_name: GarageName,
          email: emailAddress,
      }, { merge: true })
      .then(() => {
          console.log("User details updated successfully!");
      })
      .catch((error) => {
          console.error("Error updating user details: ", error);
      });
    } else {
      alert("Please fill in the description first.");
    }
  }
//function to edit the name.
  function editName() {
    const newGarageName = prompt("Please enter the Name:", GarageName);
    if (newGarageName) {
      setGarageName(newGarageName);
    }
    alert("Name updated successfully!");
  }
//function to add the phone number.
  function addPhoneNumber() {
    const newPhoneNumber = prompt(
        "Please enter your new Phone Number:",
        phoneNumber
    );
    if(newPhoneNumber.length !== 10){
      alert("Please enter a valid phone number with 10 digits.");
      return;
    }
    else if (newPhoneNumber) {
        setPhoneNumber(newPhoneNumber);
        alert("Phone number updated successfully!");

        // Save phone number to Garage Users collection
        const userId = auth.currentUser.uid; // Get the current user's ID
        firestore.collection("Garage Users").doc(userId).set({
            garage_phonenumber: newPhoneNumber,
        }, { merge: true }) // Using  merge to update existing document
        .then(() => {
            console.log("Phone number updated successfully!");
        })
        .catch((error) => {
            console.error("Error updating phone number: ", error);
        });
    }
  }
//function to add the email address and using firebase authentication to update the email address,not completly implemented.
  function addEmail() {
    const newEmail = prompt(
        "Please enter your new email address:",
        emailAddress
    );
    
    if (newEmail) {
        const user = auth.currentUser; // Get the current user

        // Update the email in Firebase Authentication
        user.updateEmail(newEmail)
        .then(() => {
            
            setEmailAddress(newEmail); // Update state locally

            const userId = user.uid; // Get the current user's ID
            firestore.collection("Garage Users").doc(userId).set({
                email: newEmail,
            }, { merge: true })
            .then(() => {
                console.log("Email updated successfully in Firestore!");
            })
            .catch((error) => {
                console.error("Error updating email in Firestore: ", error);
            });
        })
        .catch((error) => {
            console.error("Error updating email in Firebase Auth: ", error);
            alert(`Failed to update email: ${error.message}`);
        });
    }
}


  const toggleService = (service) => {
    setSelectedServices(prevSelected => 
      prevSelected.includes(service)
        ? prevSelected.filter(s => s !== service)
        : [...prevSelected, service]
    );
  };
//function to save the services offered in the garageDetails collection.
  const saveServices = async () => {
    if(selectedServices.length === 0){
      alert("Please enter at least one service.");
      return;
    }
    try {
      const userId = auth.currentUser.uid;
      await firestore.collection("GarageDetails").doc(userId).update({
        services: selectedServices
      });
      setServicesOfferedArr(selectedServices); // Update the main array with selected services
      alert("Services saved successfully!");
    } catch (error) {
      console.error("Error saving services: ", error);
      alert("Error saving services. Please try again.");
    }
  };

  const handleProfileImageClick = () => {
    fileInputRef.current.click();
  };

  const handleProfileImageChange = async (event) => {
    if (event.target.files[0]) {
      setIsUploading(true);
      try {
        await uploadProfileImage(event.target.files[0]);
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Failed to upload image. Please try again.");
      }
      setIsUploading(false);
    }
  };

  const uploadProfileImage = async (file) => {
    const userId = auth.currentUser.uid;
    const storageRef = ref(storage, `GarageUserProfileImages/${userId}`);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    await firestore.collection("Garage Users").doc(userId).update({
      profileImageUrl: downloadURL
    });

    setProfileImageUrl(downloadURL);
  };

  const deleteProfileImage = async () => {
    const userId = auth.currentUser.uid;
    const storageRef = ref(storage, `GarageUserProfileImages/${userId}`);
    
    try {
      await deleteObject(storageRef);
      await firestore.collection("Garage Users").doc(userId).update({
        profileImageUrl: null
      });
      setProfileImageUrl(null);
      alert("Profile image deleted successfully.");
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Failed to delete image. Please try again.");
    }
  };

  const handleBannerImageClick = () => {
    bannerInputRef.current.click();
  };

  const handleBannerImageChange = async (event) => {
    if (event.target.files[0]) {
      setIsUploadingBanner(true);
      try {
        await uploadBannerImage(event.target.files[0]);
      } catch (error) {
        console.error("Error uploading banner image:", error);
        alert("Failed to upload banner image. Please try again.");
      }
      setIsUploadingBanner(false);
    }
  };

  const uploadBannerImage = async (file) => {
    const userId = auth.currentUser.uid;
    const storageRef = ref(storage, `GarageUserProfileImages/GarageBannerImages/${userId}`);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    const garageDetailsRef = firestore.collection("GarageDetails").doc(userId);
    
    await garageDetailsRef.set({
      bannerImageUrl: downloadURL
    }, { merge: true });

    setBannerImageUrl(downloadURL);
  };

  const deleteBannerImage = async () => {
    const userId = auth.currentUser.uid;
    const storageRef = ref(storage, `GarageUserProfileImages/GarageBannerImages/${userId}`);
    
    try {
      await deleteObject(storageRef);
      await firestore.collection("GarageDetails").doc(userId).update({
        bannerImageUrl: null
      });
      setBannerImageUrl(null);
      alert("Banner image deleted successfully.");
    } catch (error) {
      console.error("Error deleting banner image:", error);
      alert("Failed to delete banner image. Please try again.");
    }
  };

  const togglePaymentMethod = (method) => {
    setPaymentMethods(prevMethods => ({
      ...prevMethods,
      [method]: !prevMethods[method]
    }));
  };

  const savePaymentMethods = async () => {
    const selectedMethods = Object.entries(paymentMethods)
      .filter(([_, isSelected]) => isSelected)
      .map(([method]) => method);

    if (selectedMethods.length === 0) {
      alert("Please select at least one payment method.");
      return;
    }

    try {
      const userId = auth.currentUser.uid;
      await firestore.collection("GarageDetails").doc(userId).update({
        paymentMethods: selectedMethods
      });
      alert("Payment methods updated successfully!");
    } catch (error) {
      console.error("Error saving payment methods:", error);
      alert(`Error updating payment methods: ${error.message}`);
    }
  };

  const handleAutoLocation = async (coordinates) => {
    try {
      const userId = auth.currentUser.uid;
      
      // Update location in Firestore
      await firestore.collection("Garage Users").doc(userId).update({
        garage_location: {
          lat: coordinates.lat,
          lng: coordinates.lng
        }
      });

      // Update map view and marker
      if (mapInstanceRef.current) {
        // Remove existing markers
        mapInstanceRef.current.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            mapInstanceRef.current.removeLayer(layer);
          }
        });

        // Add new marker and update view
        mapInstanceRef.current.setView([coordinates.lat, coordinates.lng], 12);
        L.marker([coordinates.lat, coordinates.lng])
          .addTo(mapInstanceRef.current)
          .bindPopup(GarageName)
          .openPopup();

        // Fetch and update address description
        await fetchAddress(coordinates.lat, coordinates.lng);
      }

      alert("Location updated successfully!");
    } catch (error) {
      console.error("Error updating location:", error);
      alert("Failed to update location. Please try again.");
    }
  };

//frender the manage garage details page.
  return (
    <div className="ManageGarageDetailsContainer">
      {isMobile ? <Mobileheader /> : <GarageNavbar />}

      <main className="ManageGarageDetailsMain">
        <header className="ManageGarageDetailsHeader">
          <Headericons Title={"Manage Garage Details"} />
        </header>

        {isLoading ? (
          <Loader />
        ) : (
          <div className="ManageGarageDetailsContent">
            <section className="ManageGarageDetailsContent_PfpAndBanner">
              <div className="ManageGarageDetailsContent_PfpAndBanner_Banner">
                <div 
                  onClick={handleBannerImageClick}
                  className="banner-image-container"
                >
                  {isUploadingBanner && (
                    <div className="upload-overlay">
                      Uploading...
                    </div>
                  )}
                  {bannerImageUrl ? (
                    <img
                      src={bannerImageUrl}
                      alt="Garage banner"
                      className="ManageGarageDetailsContent_PfpAndBanner_Banner_Img"
                    />
                  ) : (
                    <div className="empty-banner-image">
                      <button className="upload-button">Upload Banner</button>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={bannerInputRef}
                  onChange={handleBannerImageChange} 
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>

              <div className="ManageGarageDetailsContent_PfpAndBanner_Pfp">
                <div 
                  onClick={handleProfileImageClick}
                  className="profile-image-container"
                >
                  {isUploading && (
                    <div className="upload-overlay">
                      Uploading...
                    </div>
                  )}
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt="User profile picture"
                      className="ManageGarageDetailsContent_PfpAndBanner_Pfp_Img"
                    />
                  ) : (
                    <div className="empty-profile-image">
                      <button className="upload-button">Upload Image</button>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleProfileImageChange} 
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              
              </div>
            </section>
            {profileImageUrl && (
                  <button 
                    onClick={deleteProfileImage}
                    className="delete-image-button"
                  >
                    Delete Image
                  </button>
                )}
            {bannerImageUrl && (
              <button 
                onClick={deleteBannerImage}
                className="delete-image-button"
              >
                Delete Banner Image
              </button>
            )}
            <div style={{ height: "70px" }}></div>

            <section className="ManageGarageDetailsContent_GarageName">
              <p className="ManageGarageDetailsContent_GarageName_p">
                <input
                  type="text"
                  className="ManageGarageDetailsContent_GarageName_Input"
                  value={GarageName}
                />
              </p>

              <button
                onClick={editName}
                className="ManageGarageDetailsContent_GarageName_Icon"
              >
                <img
                  src="icon/Edit.png"
                  alt="Edit name"
                  className="ManageGarageDetailsContent_GarageName_Icon_Img"
                />
              </button>
            </section>

            <section className="ManageGarageDetails_Description">
              <div className="ManageGarageDetails_Description_Header">
                <strong className="ManageGarageDetails_Description_Header_Text">
                  Garage Description
                </strong>
                <button
                  onClick={editDescription}
                  className="ManageGarageDetails_Description_Header_Button"
                >
                  <img
                    src="icon/Edit.png"
                    alt="Edit description"
                    className="ManageGarageDetails_Description_Header_Button_Img"
                  />
                </button>
              </div>

              <div className="ManageGarageDetails_Description_Box">
                <div className="ManageGarageDetails_Description_Box_TextItem">
                  <textarea
                    className="ManageGarageDetails_Description_Box_TextArea"
                    value={GarageDescription}
                    onChange={(e) => setGarageDescription(e.target.value)}
                  ></textarea>
                </div>

                <div className="ManageGarageDetails_Description_Box_Button">
                  <button
                    className="ManageGarageDetails_Description_Box_Button_Icon"
                    id="save-btn"
                    onClick={saveGarageDetails}
                  >
                    Save
                  </button>
                </div>
              </div>
            </section>

            <div style={{ height: "20px" }}></div>

            <section className="ManageGarageDetails_GarageLocation">
              <div className="ManageGarageDetails_GarageLocation_Header">
                <strong>Garage Location</strong>
                <div className="location-buttons">
                  <button
                    className="change-location-button"
                    onClick={saveLocation}
                  >
                    Pick on Map
                  </button>
                  <LocationPicker setLocation={handleAutoLocation} />
                </div>
              </div>
              <div className="ManageGarageDetails_GarageLocation_MapContainer">
                <div id="map" ref={mapRef} style={{ height: '280px', width: '100%' }}></div>
              </div>

              <div className="ManageGarageDetails_GarageLocation_Location_Footer">
                <div className="ManageGarageDetails_GarageLocation_Location_Footer_Text">
                  <p>{locationDescription}</p>
                </div>
              </div>
            </section>

            <div style={{ height: "20px" }}></div>

            <section className="ManageGarageDetails_ContactDetails">
              <div className="ManageGarageDetails_ContactDetails_Header">
                <strong> Garage Contact</strong>
              </div>

              <div className="ManageGarageDetails_ContactDetails_Content">
                <div className="ManageGarageDetails_ContactDetails_Content_Phone">
                  <div className="ManageGarageDetails_ContactDetails_Content_Phone_Number">
                    Phone Number: {phoneNumber}
                  </div>
                  <div className="ManageGarageDetails_ContactDetails_Content_Phone_Icon">
                    <button
                      className="ManageGarageDetails_ContactDetails_Content_Phone_Icon_Button"
                      id="Add-phn-btn"
                      onClick={addPhoneNumber}
                    >
                      <img
                        src="icon/Edit.png"
                        alt="Edit phone number"
                        className="ManageGarageDetails_ContactDetails_Content_Phone_Icon_Button_Img"
                      />
                      Edit Phone number
                    </button>
                  </div>
                </div>

                <div className="ManageGarageDetails_ContactDetails_Content_Email">
                  <div className="ManageGarageDetails_ContactDetails_Content_Email_Address">
                    Email Address: {emailAddress}
                  </div>
                  <div className="ManageGarageDetails_ContactDetails_Content_Email_Icon">
                    <button
                      className="ManageGarageDetails_ContactDetails_Content_Email_Icon_Button"
                      id="Add-email-btn"
                      onClick={addEmail}
                    >
                      <img
                        src="icon/Edit.png"
                        alt="Edit email"
                        className="ManageGarageDetails_ContactDetails_Content_Email_Icon_Button_Img"
                      />
                      Edit Email Address
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="ManageGarageDetails_OperatingHours">
              <div className="ManageGarageDetails_OperatingHours_Header">
                <strong>Garage Operating Hours</strong>
              </div>

              <div className="ManageGarageDetails_OperatingHours_Content">
                <div className="ManageGarageDetails_OperatingHours_Content_ToggleList">
                  {Object.entries(operatingHours).map(([day, { isOpen, openTime, closeTime }]) => (
                    <div
                      key={day}
                      className="ManageGarageDetails_OperatingHours_Content_ToggleItem"
                    >
                      <span className="days">{day}</span>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={isOpen}
                          onChange={() => toggleOperating(day)}
                        />
                        <span className="slider"></span>
                      </label>
                      <span>{isOpen ? "Open" : "Closed"}</span>
                      {isOpen && (
                        <>
                          <span>From</span>
                          <input
                            type="time"
                            value={openTime || ''}
                            onChange={(e) => handleTimeChange(day, 'openTime', e.target.value)}
                          />
                          <span>To</span>
                          <input
                            type="time"
                            value={closeTime || ''}
                            onChange={(e) => handleTimeChange(day, 'closeTime', e.target.value)}
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
                <div className="ManageGarageDetails_OperatingHours_SaveButton">
                  <button
                    className="ManageGarageDetails_OperatingHours_SaveButton_Button"
                    onClick={saveGarageDetails}
                  >
                    Save Operating Hours
                  </button>
                </div>
              </div>
            </section>

            <section className="ManageGarageDetails_ServicesOffered">
              <div className="ManageGarageDetails_ServicesOffered_Header">
                <strong>Garage Services Offered</strong>
              </div>

              <div className="ManageGarageDetails_ServicesOffered_Content">
                <div className="ManageGarageDetails_ServicesOffered_Content_CheckboxGroup">
                  {servicesOfferedArr.map((offered, index) => (
                    <label key={index}>
                      <input
                        className="ManageGarageDetails_ServicesOffered_Content_CheckboxInput"
                        type="checkbox"
                        checked={selectedServices.includes(offered)}
                        onChange={() => toggleService(offered)}
                      />{" "}
                      {offered}
                    </label>
                  ))}
                  <button
                    className="ManageGarageDetails_ServicesOffered_Content_CheckboxGroup_AddManualButton"
                    onClick={addManual}
                  >
                    <img
                      src="icon/Edit.png"
                      alt="Add Manually"
                      className="ManageGarageDetails_ServicesOffered_Content_CheckboxGroup_AddManualButton_Img"
                    />
                    Add manually
                  </button>
                </div>
                <div className="ManageGarageDetails_ServicesOffered_SaveButton">
                  <button
                    className="ManageGarageDetails_ServicesOffered_SaveButton_Button"
                    onClick={saveServices}
                  >
                    Save Services
                  </button>
                </div>
              </div>
            </section>

            <div style={{ height: "20px" }}></div>

            <section className="ManageGarageDetails_Payment">
              <div className="ManageGarageDetails_Payment_Header">
                <strong>Accepted Payment Methods</strong>
              </div>

              <div className="ManageGarageDetails_Payment_Content">
                <p className="payment-methods-info">
                  We currently only accept the following payment methods:
                </p>
                <div className="ManageGarageDetails_Payment_Content_Methods">
                  <div className="ManageGarageDetails_Payment_Content_Methods_CheckBoxes">
                    {Object.keys(paymentMethods).map((method) => (
                      <label key={method} className="payment-method-label">
                        <input
                          type="checkbox"
                          checked={paymentMethods[method]}
                          onChange={() => togglePaymentMethod(method)}
                        />
                        {method}
                      </label>
                    ))}
                  </div>
                  <div className="ManageGarageDetails_Payment_Content_Methods_Button">
                    <button
                      className="ManageGarageDetails_Payment_Content_Methods_Button_Button"
                      onClick={savePaymentMethods}
                    >
                      Update Payment Methods
                    </button>
                  </div>
                </div>
              </div>
            </section>
            <div style={{ height: "20px" }}></div>

            <section className="ManageGarageDetails_Payment_Content_Bank_Buttons">
              <div className="ManageGarageDetails_Payment_Content_Bank_Buttons_Header">
                <strong>Garage Bank Details</strong>
              </div>
              <div className="ManageGarageDetails_Payment_Content_Bank_Buttons_BankDetails">
                <BankDetails />
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageGarageDetails;
