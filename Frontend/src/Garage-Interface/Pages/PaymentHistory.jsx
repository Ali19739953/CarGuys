import React, { useState, useEffect } from "react";
import GarageNavbar from "../Components/GarageNavbar";
// import Searchbar from "../Components/Searchbar";
//needs to be styled according to other relevant pages. I dont have the time to do it everything(THE WHOLE PROJECT).

import "./PaymentHistory.css";
import Mobileheader from "../Components/Mobileheader";
import Headericons from "../Components/Headericons";
import { useDispatch, useSelector } from "react-redux";
import { fetchGarageBookings } from "../../Redux/Features/SharedSlices/Bookings/bookingSlice";
import { auth } from "../../firebaseConfig";
import { getStorage, ref, getDownloadURL, listAll } from "firebase/storage";
import Loader from "../Components/Loader";

const getPaymentMethodIcon = (paymentMethod) => {
  const methodLower = paymentMethod?.toLowerCase() || '';
  
  switch (methodLower) {
    case 'tabby':
      return '/icon/tabby.png';
    case 'cod':
    case 'cash on delivery':
      return '/icon/cod.png';
    case 'card':
    case 'credit card':
    case 'debit card':
      return '/icon/visa.png';
    default:
      return '/icon/visa.png';
  }
};

function PaymentHistory() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const dispatch = useDispatch();
  const bookings = useSelector((state) => state.booking.bookingRequests);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 4;

  // Filter completed bookings with payment done
  const completedPayments = bookings.filter(
    booking => booking.isCompleted && booking.paymentDone
  );

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
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
//Function to download the contract for the booking
  const handleContractDownload = async (booking) => {
    try {
      const storage = getStorage();
      const garageId = booking.garageId;
      const bookingId = booking.id;
      
      // List all files in the directory to find the relevant contract
      const contractsRef = ref(storage, `GarageDetails/${garageId}/serviceContracts`);
      const contractsList = await listAll(contractsRef);
      
      // Find the relevant contract for the booking ID
      const relevantContracts = contractsList.items.filter(item => 
        item.name.startsWith(`${bookingId}_`) && item.name.endsWith('_contract.pdf')
      );

      if (relevantContracts.length === 0) {
        throw new Error('No contract found for this booking');
      }

      // Sort by name (which includes timestamp) to get the relevant contract
      const latestContract = relevantContracts.sort((a, b) => b.name.localeCompare(a.name))[0];
      const url = await getDownloadURL(latestContract);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.download = `CarGuys_Service_Agreement_${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading contract:", error);
      alert("Unable to download contract. Please try again later.");
    }
  };

  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = completedPayments.slice(indexOfFirstPayment, indexOfLastPayment);
  const totalPages = Math.ceil(completedPayments.length / paymentsPerPage);

  return (
    <div className="PaymentHistoryContainer">
      {isMobile ? <Mobileheader /> : <GarageNavbar />}

      <main className="PaymentHistoryMain">
        <header className="PaymentHistoryHeader">
          <Headericons Title={"Payment History"} />
        </header>

        {isLoading ? (
          <Loader />
        ) : (
          <div className="PaymentHistoryContent">
            {completedPayments.length === 0 ? (
              <div className="no-payments-message">No payment history available</div>
            ) : (
              currentPayments.map((payment) => (
                <div key={payment.id} className="PaymentItem">
                  <div className="PaymentItemBox">
                    <div className="PaymentItemBox_ImageAndName">
                      <img 
                        src={payment.selectedVehicle?.imageUrl || "/default-vehicle-image.png"} 
                        alt="Vehicle" 
                        className="PaymentItemBox_Image"
                      />
                      <div className="CustomerInfo">
                        <strong>{payment.first_name} {payment.last_name}</strong>
                        <div className="PaymentDetails">
                          <div data-label="Payment ID:"><span>{payment.id}</span></div>
                          <div data-label="Completion Date:"><span>{payment.deliveryDate}</span></div>
                          <div data-label="Services:"><span>{payment.selectedServices?.join(', ')}</span></div>
                          <div data-label="Vehicle:"><span>{payment.selectedVehicle?.make} {payment.selectedVehicle?.model}</span></div>
                          <div data-label="Number Plate:"><span>{payment.selectedVehicle?.numberPlate}</span></div>
                          <div data-label="Payment Method:" className="PaymentMethod">
                            <img 
                              src={getPaymentMethodIcon(payment.selectedPayment)}
                              alt={payment.selectedPayment}
                              className="PaymentMethod_Icon"
                            />
                            <span>{payment.selectedPayment}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="PaymentItemBox_PriceAndButton">
                      <h4>AED {payment.price}</h4>
                      <button 
                        className="PaymentItemBox_AccessPostServiceContractButton"
                        onClick={() => handleContractDownload(payment)}
                      >
                        Access Service Contract
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div className="pagination">
                <button 
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    disabled={currentPage === 1}
                    className="pagination-button"
                >
                    Previous
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
                    >
                        {index + 1}
                    </button>
                ))}

                <button 
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-button"
                >
                    Next
                </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default PaymentHistory;