//add css
import React from "react";
import GarageNavbar from "../Components/GarageNavbar";
// import Searchbar from "../Components/Searchbar";
import { Link } from "react-router-dom";
import "./GarageSettings.css";
import { useState, useEffect } from "react";
import Mobileheader from "../Components/Mobileheader";
import Headericons from "../Components/Headericons";

import "./CompletedServices.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchGarageBookings } from "../../Redux/Features/SharedSlices/Bookings/bookingSlice";
import { auth } from "../../firebaseConfig";
import { createNotification } from "../../Redux/Features/SharedSlices/Bookings/notificationSlice";
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import { firestore } from "../../firebaseConfig";
import Loader from "../Components/Loader";

function CompletedServices() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const dispatch = useDispatch();
  
  const bookings = useSelector((state) => state.booking.bookingRequests);
  const [completedServices, setCompletedServices] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 5;

  // Calculate pagination values
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = completedServices.slice(indexOfFirstService, indexOfLastService);
  const totalPages = Math.ceil(completedServices.length / servicesPerPage);

  // Add loading state
  const [isLoading, setIsLoading] = useState(true);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoading(true); // Start loading
        dispatch(fetchGarageBookings(user.uid))
          .finally(() => {
            setIsLoading(false); // Stop loading
          });
      } else {
        setIsLoading(false); // No user, stop loading
      }
    });

    window.addEventListener("resize", handleResize);
    return () => {
      unsubscribe();
      window.removeEventListener("resize", handleResize);
    };
  }, [dispatch]);

  useEffect(() => {
    setCompletedServices(bookings.filter(booking => booking.isCompleted));
  }, [bookings]);

  useEffect(() => {
    console.log('Completed services:', completedServices); // Debug log 
  }, [completedServices]);

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  const handleSendPaymentLink = async (service) => {
    try {
      console.log('Service object:', service); // Debug log

      if (!service) {
        alert('Service object is undefined');
        return;
      }

      // Added validation for required fields
      if (!service.price) {
        alert('Service price is missing');
        return;
      }
      if (!service.id) {
        alert('Service ID is missing');
        return;
      }
      if (!service.userId) {
        alert('User ID is missing');
        return;
      }

     //api call to node server for payment session creation
      const response = await fetch('http://localhost:3000/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: service.price,
          serviceId: service.id,
          garageId: auth.currentUser?.uid,
          userId: service.userId,
          first_name: service.first_name,
          last_name: service.last_name,
          garageName: service.garageName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment session creation failed');
      }

      const data = await response.json();
      if (!data.paymentUrl) {
        throw new Error('Payment URL not received from server');
      }

      // Updating Firestore 
      try {
        await firestore.collection('BookingRequests').doc(service.id).update({
          paymentRequestDate: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
      } catch (firestoreError) {
        console.error('Firestore update error:', firestoreError);
        throw new Error(`Failed to update booking status: ${firestoreError.message}`);
      }

      // Create notification 
      try {
        await dispatch(createNotification({
          recipientId: service.userId,
          type: 'PAYMENT_REQUEST',
          message: `Payment request of AED ${service.price} from ${service.garageName || 'the garage'}`,
          additionalData: {
            serviceId: service.id,
            amount: service.price,
            paymentUrl: data.paymentUrl,
            garageName: service.garageName || 'the garage',
            vehicleInfo: service.selectedVehicle || {},
            timestamp: new Date().toISOString()
          }
        })).unwrap();
      } catch (notificationError) {
        console.error('Notification error:', notificationError);
        
      }

      alert('Payment link sent successfully!');
    } catch (error) {
      console.error('Error details:', error);
      alert(`Error sending payment link: ${error.message}`);
    }
  };
//notification for COD payment
  const handleCODNotification = async (service) => {
    try {
      await dispatch(createNotification({
        recipientId: service.userId,
        type: 'COD_PICKUP_REMINDER',
        message: `Your vehicle is ready for pickup. Please collect your vehicle and complete the cash payment of AED ${service.price}`,
        additionalData: {
          serviceId: service.id,
          amount: service.price,
          garageName: service.garageName || 'the garage',
          vehicleInfo: service.selectedVehicle || {},
          timestamp: new Date().toISOString()
        }
      })).unwrap();
      alert('Pickup reminder sent to customer!');
    } catch (error) {
      console.error('Notification error:', error);
      alert('Failed to send pickup reminder');
    }
  };

  const handleMarkAsPaid = async (service) => {
    try {
      // Update Firestore document
      await firestore.collection('BookingRequests').doc(service.id).update({
        paymentDone: true,
        lastUpdated: new Date().toISOString()
      });

      // Update local state to reflect the change
      setCompletedServices(prevServices =>
        prevServices.map(s =>
          s.id === service.id ? { ...s, paymentDone: true } : s
        )
      );

      alert('Payment marked as complete!');
    } catch (error) {
      console.error('Error marking payment as complete:', error);
      alert('Failed to mark payment as complete');
    }
  };

  return (
    <div className="CompletedServicesContainer">
      {isMobile ? <Mobileheader /> : <GarageNavbar />}

      <main className="CompletedServicesMain">
        <header className="CompletedServicesHeader">
          <Headericons Title={"Completed Services"}/>
        </header>

        {isLoading ? (
          <Loader />
        ) : (
          <div className="CompletedServicesContent">
            {completedServices.length === 0 ? (
              <div className="no-services-message">No completed services at the moment</div>
            ) : (
              <>
                {currentServices.map((service) => (
                  <div key={service.id} className="CompletedServicesItem">
                    <div className="CompletedServicesItem_Box">
                      <div className="CompletedServicesItem_Box_ImageAndName">
                        <img 
                          src={service.selectedVehicle?.imageUrl || "/default-vehicle-image.png"} 
                          alt="Vehicle" 
                        />
                        <div className="CompletedServicesItem_Box_Content">
                          <strong>{service.first_name} {service.last_name}</strong>
                          <div className="CompletedServicesItem_Box_Fields">
                            <div data-label="Service ID:"><span>{service.id}</span></div>
                            <div data-label="Car Number:"><span>{service.selectedVehicle?.numberPlate}</span></div>
                            <div data-label="Order Date:"><span>{service.selectedDate}</span></div>
                            <div data-label="Delivery Date:"><span>{service.deliveryDate}</span></div>
                            <div data-label="Final Price:"><span>AED {service.price || 'N/A'}</span></div>
                            <div data-label="Services Requested:"><span>{service.selectedServices?.join(', ')}</span></div>
                            <div data-label="Payment Method:"><span>{service.selectedPayment}</span></div>
                          </div>
                        </div>
                      </div>
                      <div className="CompletedServicesItem_Box_Button">
                        {service.paymentDone ? (
                          <div className="payment-status-success">Payment Received ✓</div>
                        ) : (
                          <>
                            {service.selectedPayment === 'COD' ? (
                              <div className="cod-buttons">
                                <button 
                                  className="CompletedServicesItem_Box_Button_COD"
                                  onClick={() => handleCODNotification(service)}
                                >
                                  Send pickup reminder
                                </button>
                                <button 
                                  className="CompletedServicesItem_Box_Button_MarkPaid"
                                  onClick={() => handleMarkAsPaid(service)}
                                >
                                  Mark as Paid
                                </button>
                              </div>
                            ) : (
                              <button 
                                className="CompletedServicesItem_Box_Button_GeneratePaymentLink"
                                onClick={() => handleSendPaymentLink(service)}
                              >
                                Send payment link
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* pagination controls */}
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

export default CompletedServices;
