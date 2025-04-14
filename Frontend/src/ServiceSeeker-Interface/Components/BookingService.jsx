//dont touch, dont add css classes, dont change the structure.
//reviews not implemented yet.
//everything is working fine.
import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import NavBarMobile from './NavBarMobile'
import HeadericonsSeeker from './HeaderIconSeeker'
import NavBarSeeker from './NavBarSeeker'
import VehicleSelectBarServiceSeeker from './VehicleSelectBarServiceSeeker'
import reverseGeocode from '../../api/reverseGeocode';
import { selectSelectedVehicle } from '../../Redux/Features/SharedSlices/Vehicles/vehicleSlice'; // Import the selector
import { selectUserInfo } from '../../Redux/Features/SharedSlices/Users/userSlice'; // Import the selector
import { firestore } from '../../firebaseConfig'; // Ensure to import firestore
import { createNotification } from '../../Redux/Features/SharedSlices/Bookings/notificationSlice';
import { setCurrentBooking, addBookingRequest } from '../../Redux/Features/SharedSlices/Bookings/bookingSlice';
import { clearSelectedVehicle } from '../../Redux/Features/SharedSlices/Vehicles/vehicleSlice';
import { resetBookingState } from '../../Redux/Features/SharedSlices/Bookings/bookingSlice';
import styles from '../Modules/BookingService.module.css';
function BookingService() {
   const { garageId } = useParams();
   const location = useLocation();
   const [localUserInfo, setLocalUserInfo] = useState(null);
   const navigate = useNavigate();
   const { garage, garageDetails } = location.state || {};
   const dispatch = useDispatch();
   // Console log the passed props
   console.log("Props passed to BookingService:");
   console.log("garageId:", garageId);
   console.log("location.state:", location.state);
   console.log("garage:", garage);
   console.log("garageDetails:", garageDetails);

   const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
   
   useEffect(() => {
     const handleResize = () => {
       setIsMobile(window.innerWidth < 768);
     };
     window.addEventListener("resize", handleResize);
     return () => {
       window.removeEventListener("resize", handleResize);
     };
   }, []); 

   if (!garage || !garageDetails) {
     console.log("Garage or garageDetails is undefined");
     return <div>Error: Garage information not available. Please go back and try again.</div>;
   }

   const [selectedServices, setSelectedServices] = useState({});
   const [selectedDate, setSelectedDate] = useState('');
   const [selectedPayment, setSelectedPayment] = useState('');
   const [address, setAddress] = useState("Fetching address...");
   const[selectTime,setSelectedTime]=useState('');
//function to set the initial services to false.
   useEffect(() => {
     if (garageDetails && garageDetails.services) {
       const initialServices = {};
       garageDetails.services.forEach((service) => {
         initialServices[service] = false;
       });
       setSelectedServices(initialServices);
     }
   }, [garageDetails]);

   useEffect(() => {
     if (garage?.garage_location) {
       reverseGeocode(garage.garage_location.lat, garage.garage_location.lng)
         .then(fetchedAddress => setAddress(fetchedAddress));
     }
   }, [garage]);
//function to check if the garage is open now.
   const isOpenNow = () => {
     if (!garageDetails?.operatingHours) return 'Operating hours not available';
     
     const today = new Date().toLocaleString('en-us', { weekday: 'long' });
     const todayHours = garageDetails.operatingHours[today];

     if (!todayHours) {
       return `No operating hours available for ${today}`;
     }

     // Convert current time to hours and minutes for direct comparison
     const now = new Date();
     const currentHours = now.getHours();
     const currentMinutes = now.getMinutes();
     const currentTime = currentHours * 60 + currentMinutes; // Convert to minutes

     // Convert opening hours to minutes for comparison using the split method
     const [openHours, openMinutes] = todayHours.openTime.split(':').map(Number);
     const [closeHours, closeMinutes] = todayHours.closeTime.split(':').map(Number);
     const openTimeInMinutes = openHours * 60 + openMinutes;
     const closeTimeInMinutes = closeHours * 60 + closeMinutes;

     // Check if current time is within operating hours
     if (todayHours.isOpen && 
         currentTime >= openTimeInMinutes && 
         currentTime <= closeTimeInMinutes) {
       return `Open Now: ${todayHours.openTime} - ${todayHours.closeTime}`;
     } else {
       return 'Closed now';
     }
   };
   const contactGarage = () => {
      console.log("Contacting garage");
      alert("Contacting garage");
   }
   const selectedVehicle = useSelector(selectSelectedVehicle);
   const userInfo = useSelector(selectUserInfo); // Get user info from Redux

//function to send the request with the selected vehicle data.
   const handleSendRequest = async () => {
     try {
       // Validate if vehicle is selected
       if (!selectedVehicle) {
         throw new Error('Please select a vehicle before proceeding');
       }

       //added after testing
       if (!selectedDate) {
         throw new Error('Please select a date for the service');
       }

 
       if (!selectTime) {
         throw new Error('Please select a time for the service');
       }

       
       if (Object.values(selectedServices).every(isSelected => !isSelected)) {
         throw new Error('Please select at least one service');
       }

     
       if (!selectedPayment) {
         throw new Error('Please select a payment method');
       }

       const userId = userInfo?.user_id || userInfo?.uid;

       if (!userId) {
         throw new Error('User ID is not available');
       }

  
       const requestData = {
         garageId: garageId,
         garageName: garage?.garage_name,
         userId: userId,
         selectedVehicle: selectedVehicle,
         selectedDate: selectedDate,
         first_name: userInfo?.first_name,
         location: userInfo?.location,
         last_name: userInfo?.last_name,
         selectedTime: selectTime,
         selectedPayment: selectedPayment,
         selectedServices: Object.entries(selectedServices)
           .filter(([_, isSelected]) => isSelected)
           .map(([serviceName, _]) => serviceName),
         isPending: true,
         isCompleted: false,
         isOngoing: false,
         paymentDone: false,
         createdAt: new Date().toISOString()
       };

       // Create booking in Firestore
       const bookingRef = await firestore.collection("BookingRequests").add(requestData);

       // Create notification for garage
       await firestore.collection("Notifications").add({
         recipientId: garageId,
         type: 'BOOKING_REQUEST',
         message: `New booking request from ${userInfo.first_name} ${userInfo.last_name}`,
         timestamp: new Date().toISOString(),
         isRead: false,
         bookingId: bookingRef.id,
         additionalData: {
           services: requestData.selectedServices,
           date: requestData.selectedDate,
           time: requestData.selectedTime,
           vehicleDetails: selectedVehicle
         },
         senderId: userId
       });

       // Update Redux store
       dispatch(addBookingRequest({ id: bookingRef.id, ...requestData }));
       
       // Clear selected vehicle and booking state
       dispatch(clearSelectedVehicle());
       dispatch(resetBookingState());

       alert('Request sent successfully!');
       navigate('/ServiceStatus');
     } catch (error) {
       console.error('Error in handleSendRequest:', error);
       alert('Error sending request: ' + error.message);
     }
   };

   // Update current booking in Redux as user makes selections
   useEffect(() => {
     dispatch(setCurrentBooking({
       garageId: garageId,
       garageName: garageDetails?.garage_name,
       userId: userInfo?.user_id || userInfo?.uid,
       selectedVehicle: selectedVehicle,
       location: userInfo?.location,
       first_name: userInfo?.first_name,
       last_name: userInfo?.last_name,
       selectedDate: selectedDate,
       selectedTime: selectTime,
       selectedPayment: selectedPayment,
       selectedServices: Object.entries(selectedServices)
         .filter(([_, isSelected]) => isSelected)
         .map(([serviceName, _]) => serviceName),
     }));
   }, [dispatch, garageId, userInfo, selectedVehicle, selectedDate, selectTime, selectedPayment, selectedServices, garageDetails]); 

   return (
     <div className={styles.booking_service}>
       {isMobile ? <NavBarMobile /> : <NavBarSeeker />}
       <div className={styles.booking_service_main}>
         <HeadericonsSeeker Title={"Book a Service"}/>
         
         <div className={styles.garage_info}>
           <img src={garage?.profileImageUrl ?? "https://picsum.photos/200/300"} alt="Garage" />
           <ul className={styles.garage_info_list}>
             <li>{garage?.garage_name ?? "Garage Name Not Available"}</li>
             <li>{garageDetails?.description ?? "No description available"}</li>
             <li className={styles.distance}>
               {typeof garage?.distance === 'number' ? `${garage.distance.toFixed(2)} km away` : "Distance not available"}
             </li>
             <li className={styles.open_now}>{isOpenNow()}</li>
             <li>{address}</li>
           </ul>
         </div>

         <div className={styles.vehicle_select}>
           <VehicleSelectBarServiceSeeker/>
         </div>
         <div className={styles.service_selection}>
           <p>Select the services you wish to request</p>
           <div className={styles.service_selection_list}>
             {garageDetails && garageDetails.services && garageDetails.services.map((service) => (
               <label key={service}>
                 <input 
                   type="checkbox" 
                   checked={selectedServices[service] || false}
                   onChange={() => setSelectedServices(prev => ({...prev, [service]: !prev[service]}))}
                 />
                 {service}
               </label>
             ))}
           </div>
           <p id={styles.service_selection_date}>Select the date you wish to get your car serviced</p>
           <input 
             type="date" 
             className={styles.service_selection_date}
             value={selectedDate}
             onChange={(e) => setSelectedDate(e.target.value)}
           />
            <input 
             type="time" 
             className={styles.service_selection_time}
             value={selectTime}
             onChange={(e) => setSelectedTime(e.target.value)}
           />
         </div>
         <div className={styles.payment_options}>
           <p className={styles.payment_options_text}>Select your desired payment option</p>
           <div>
             {garageDetails?.paymentMethods && garageDetails.paymentMethods.map((method, index) => (
               <label key={index}>
                 <input 
                   type="radio" 
                   name="payment" 
                   className={styles.payment_option_radio}
                   value={method}
                   checked={selectedPayment === method}
                   onChange={(e) => setSelectedPayment(e.target.value)}
                 />
                 {method}
               </label>
             ))}
           </div>
         </div>
         <div className={styles.action_buttons}>
           <button className={styles.send_request_button} onClick={handleSendRequest}>
             Send request
           </button>
           <button className={styles.contact_garage_button} onClick={contactGarage}>
             Contact Garage
           </button>
         </div>
       </div>
     </div>
   );
}

export default BookingService;
