import React, { useState, useEffect, useMemo } from "react";
import GarageNavbar from "../Components/GarageNavbar";
// import Searchbar from "../Components/Searchbar";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Mobileheader from "../Components/Mobileheader";
import Headericons from "../Components/Headericons";
import { fetchGarageBookings } from "../../Redux/Features/SharedSlices/Bookings/bookingSlice";
import "./IncomingRequest.css";
import reverseGeocode from "../../api/reverseGeocode";
import { auth } from "../../firebaseConfig";
import { createNotification } from "../../Redux/Features/SharedSlices/Bookings/notificationSlice";
import { rejectBooking } from "../../Redux/Features/SharedSlices/Bookings/bookingSlice";
import Loader from "../Components/Loader";


function IncomingRequest() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  
  const bookings = useSelector((state) => state.booking.bookingRequests);
  const status = useSelector((state) => state.booking.status);
  const [locationAddresses, setLocationAddresses] = useState({});
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 5;
  
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  // Handle initial auth and data fetching
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
  }, [dispatch, isInitialized]);

  // Filter pending services
  const incomingservices = useMemo(() => 
    bookings.filter(booking => booking.isPending),
    [bookings]
  );

  // Handle address fetching
  useEffect(() => {
    let isSubscribed = true;

    const fetchAddresses = async () => {
      if (!incomingservices.length) return;

      const addresses = {};
      for (const service of incomingservices) {
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

    return
  }, [incomingservices]);

  // const handleAcceptBooking = async (booking) => {
  //   try {
  //     // Create notification for service seeker
  //     await dispatch(createNotification({
  //       recipientId: booking.userId,
  //       type: 'SERVICE_ONGOING',
  //       message: `Your vehicle service request has been accepted by ${booking.garageName}. Service is now ongoing.`,
  //       additionalData: {
  //         bookingId: booking.id,
  //         vehicleInfo: booking.selectedVehicle,
  //         startDate: new Date().toISOString()
  //       }
  //     }));

  //   } catch (error) {
  //     console.error('Error accepting booking:', error);
  //     alert('Error accepting booking. Please try again.');
  //   }
  // };

  const handleRejectClick = (booking) => {
    setSelectedBooking(booking);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      await dispatch(rejectBooking({
        bookingId: selectedBooking.id,
        rejectionReason: rejectionReason.trim()
      })).unwrap();
      
      // Create notification for service seeker
      await dispatch(createNotification({
        recipientId: selectedBooking.userId,
        type: 'SERVICE_REJECTED',
        message: `Your vehicle service request has been rejected by ${selectedBooking.garageName}. Reason: ${rejectionReason.trim()}`,
        additionalData: {
          bookingId: selectedBooking.id,
          vehicleInfo: selectedBooking.selectedVehicle,
          rejectionReason: rejectionReason.trim(),
          rejectionDate: new Date().toISOString()
        }
      }));
      
      setShowRejectModal(false);
      setRejectionReason("");
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('Failed to reject booking. Please try again.');
    }
  };

  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = incomingservices.slice(indexOfFirstService, indexOfLastService);
  const totalPages = Math.ceil(incomingservices.length / servicesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="IncomingRequestContainer">
      {isMobile ? <Mobileheader /> : <GarageNavbar />}

      <main className="IncomingRequestMain">
        <header className="IncomingRequestHeader">
          <Headericons Title={"Incoming Request"}/>
        </header>

        {isLoading ? (
          <Loader />
        ) : (
          <div className="IncomingRequestContent">
            {incomingservices.length === 0 ? (
              <>
                <p>No Incoming Requests at the moment.</p>
                <p>Want to see more booking requests? <Link to="/upgrade-plan">Upgrade your plan</Link> or contact us to learn how we can help attract more customers to your garage.</p>
              </>
            ) : (
              <>
                {currentServices.map((service) => (
                  <div key={service.id} className="IncomingRequestItem">
                    <div className="IncomingRequestItem_Box">
                      <div className="IncomingRequestItem_Box_ImageAndName">
                        <img 
                          src={service.selectedVehicle?.imageUrl || "/default-vehicle-image.png"} 
                          alt="Vehicle" 
                        />
                        <div className="IncomingRequestItem_Box_Content">
                          <strong>{service.first_name} {service.last_name}</strong>
                          <strong>Location: {locationAddresses[service.id] || 'Loading...'}</strong>
                          <div className="IncomingRequestItem_Box_Fields">
                            <div data-label="Service ID:"><span>{service.id}</span></div>
                            <div data-label="Services Requested:"><span>{service.selectedServices?.join(', ')}</span></div>
                            <div data-label="Vehicle:"><span>{service.selectedVehicle?.make} {service.selectedVehicle?.model}</span></div>
                            <div data-label="Plate Number:"><span>{service.selectedVehicle?.numberPlate}</span></div>
                            <div data-label="Request Date:"><span>{service.selectedDate}</span></div>
                            <div data-label="Request Time:"><span>{service.selectedTime}</span></div>
                            <div data-label="Payment Method:"><span>{service.selectedPayment}</span></div>
                            <div data-label="Status:"><span>{service.isPending ? 'Pending' : 'On going'}</span></div>
                          </div>
                        </div>
                      </div>
                      <div className="IncomingRequestItem_Box_Button">
                        <Link to={`/Preservicecontractbuilder/${service.id}`}>
                          <button className="IncomingRequestItem_Box_Button_ProceedToPreService">
                            Accept Request
                          </button>
                        </Link>
                        <button 
                          className="IncomingRequestItem_Box_Button_RejectRequest"
                          onClick={() => handleRejectClick(service)}
                        >
                          Reject Request
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
      
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Reject Booking Request</h2>
            <p>Please provide a reason for rejecting this booking:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              style={{
                width: '100%',
                padding: '0px',
                marginTop: '10px',
                borderRadius: '4px',
                border: 'none',
                borderBottom: '2px solid #ccc',
                backgroundColor: 'white',
                color: 'white',
                background: 'transparent',
                fontWeight: 'bold'
              }}
            />
            <div className="modal-buttons">
              <button 
                onClick={handleRejectConfirm}
                className="modal-button confirm"
              >
                Confirm Rejection
              </button>
              <button 
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                  setSelectedBooking(null);
                }}
                className="modal-button cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IncomingRequest;
