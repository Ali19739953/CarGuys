import React, { useState, useEffect, useMemo, useCallback } from "react";
import GarageNavbar from "../Components/GarageNavbar";
// import Searchbar from "../Components/Searchbar";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Mobileheader from "../Components/Mobileheader";
import Headericons from "../Components/Headericons";
import { fetchGarageBookings, updateBookingStatusInFirestore } from "../../Redux/Features/SharedSlices/Bookings/bookingSlice";
import { createNotification } from "../../Redux/Features/SharedSlices/Bookings/notificationSlice";
import "./ManageOngoingservice.css";
import reverseGeocode from "../../api/reverseGeocode";
import { auth } from "../../firebaseConfig";
import Loader from "../Components/Loader";


function ManageOngoingservice() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 5;
  
  const bookings = useSelector((state) => state.booking.bookingRequests);
  const [locationAddresses, setLocationAddresses] = useState({});
  
  // Filter only ongoing services using useMemo
  const ongoingServices = useMemo(() => 
    bookings.filter(booking => booking.isOngoing),
    [bookings]
  );
  
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = ongoingServices.slice(indexOfFirstService, indexOfLastService);
  const totalPages = Math.ceil(ongoingServices.length / servicesPerPage);

  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Combined initialization effect
  useEffect(() => {
    let isSubscribed = true;
    let authUnsubscribe = null;

    const initializeData = () => {
      authUnsubscribe = auth.onAuthStateChanged((user) => {
        if (user && isSubscribed && !isInitialized) {
          setIsLoading(true);
          dispatch(fetchGarageBookings(user.uid))
            .finally(() => {
              setIsLoading(false);
              setIsInitialized(true);
            });
        } else {
          setIsLoading(false);
        }
      });
    };

    initializeData();
    window.addEventListener("resize", handleResize);

    return () => {
      isSubscribed = false;
      if (authUnsubscribe) {
        authUnsubscribe();
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [dispatch, isInitialized, handleResize]);

  // Handle address fetching
  useEffect(() => {
    let isSubscribed = true;

    const fetchAddresses = async () => {
      if (!ongoingServices.length) return;

      const addresses = {};
      for (const service of ongoingServices) {
        if (!service.location) {
          addresses[service.id] = "Location not provided";
          continue;
        }

        const { lat, lng } = service.location;
        if (isNaN(lat) || isNaN(lng)) {
          addresses[service.id] = "Invalid location format";
          continue;
        }

        try {
          const address = await reverseGeocode(lat, lng);
          if (isSubscribed) {
            addresses[service.id] = address;
          }
        } catch (error) {
          if (isSubscribed) {
            addresses[service.id] = "Error fetching address";
          }
        }
      }

      if (isSubscribed) {
        setLocationAddresses(addresses);
      }
    };

    fetchAddresses();

    return () => {
      isSubscribed = false;
    };
  }, [ongoingServices]);

  const handleMarkAsComplete = async (service) => {
    try {
      const updateData = {
        id: service.id,
        status: 'completed',
        price: service.price || 0,
        deliveryDate: service.deliveryDate || new Date().toISOString().split('T')[0]
      };

      console.log('Updating service with data:', updateData);

      await dispatch(updateBookingStatusInFirestore(updateData)).unwrap();
      
      // Create notification for service seeker
      await dispatch(createNotification({
        recipientId: service.userId,
        type: 'SERVICE_COMPLETED',
        message: `Your vehicle service at ${service.garageName} has been completed. Vehicle: ${service.selectedVehicle?.make} ${service.selectedVehicle?.model} (${service.selectedVehicle?.numberPlate})`,
        additionalData: {
          bookingId: service.id,
          vehicleInfo: service.selectedVehicle,
          completionDate: new Date().toISOString(),
          services: service.selectedServices,
          price: service.price
        }
      }));

      navigate('/CompletedServices');
    } catch (error) {
      console.error('Failed to mark service as complete:', error);
      alert('There was an error updating the service status. Please try again.');
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="ManageOngoingServicesContainer">
      {isMobile ? <Mobileheader /> : <GarageNavbar />}

      <main className="ManageOngoingServicesMain">
        <header className="ManageOngoingServicesHeader">
          <Headericons Title={"Manage Ongoing Services"}/>
        </header>

        {isLoading ? (
          <Loader />
        ) : (
          <div className="ManageOngoingServicesContent">
            {ongoingServices.length === 0 ? (
              <div className="no-services-message">No ongoing services at the moment</div>
            ) : (
              <>
                {currentServices.map((service) => (
                  <div key={service.id} className="ManageOngoingServicesItem">
                    <div className="ManageOngoingServicesItem_Box">
                      <div className="ManageOngoingServicesItem_Box_ImageAndName">
                        <img 
                          src={service.selectedVehicle?.imageUrl || "/default-vehicle-image.png"} 
                          alt="Vehicle" 
                        />
                        <div className="ManageOngoingServicesItem_Box_Content">
                          <strong>{service.first_name} {service.last_name}</strong>
                          <strong>Location: {locationAddresses[service.id] || 'Loading...'}</strong>
                          <div className="ManageOngoingServicesItem_Box_Fields">
                            <div data-label="Service ID:"><span>{service.id}</span></div>
                            <div data-label="Services Requested:"><span>{service.selectedServices?.join(', ')}</span></div>
                            <div data-label="Vehicle:"><span>{service.selectedVehicle?.make} {service.selectedVehicle?.model}</span></div>
                            <div data-label="Plate Number:"><span>{service.selectedVehicle?.numberPlate}</span></div>
                            <div data-label="Request Date:"><span>{service.selectedDate}</span></div>
                            <div data-label="Request Time:"><span>{service.selectedTime}</span></div>
                            <div data-label="Payment Method:"><span>{service.selectedPayment}</span></div>
                            <div data-label="Quoted Price:"><span>AED {service.price}</span></div>
                            <div data-label="Delivery Date:"><span>{service.deliveryDate}</span></div>
                            <div data-label="Status:"><span>Ongoing</span></div>
                          </div>
                        </div>
                      </div>
                      <div className="ManageOngoingServicesItem_Box_Button">
                        <button 
                          className="ManageOngoingServicesItem_Box_Button_AccessPreServiceContract"
                          onClick={() => handleMarkAsComplete(service)}
                        >
                          Mark as Complete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pagination">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-button"
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-button"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default ManageOngoingservice;
