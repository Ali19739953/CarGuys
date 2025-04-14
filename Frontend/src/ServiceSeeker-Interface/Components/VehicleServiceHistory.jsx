import React, { useState, useMemo } from 'react';
// import styles from '../Modules/VehicleService.module.css';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserBookings } from '../../Redux/Features/SharedSlices/Bookings/bookingSlice';
import { useEffect } from 'react';
import { auth } from '../../firebaseConfig';

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

const VehicleServiceHistory = ({ vehicle, onClose }) => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const dispatch = useDispatch();
  
  // Get user info and bookings from Redux store
  const userInfo = useSelector(state => state.user.userInfo);
  const bookings = useSelector(state => state.booking.bookingRequests);

  // Fetch user's bookings when component mounts from the redux 
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        dispatch(fetchUserBookings(user.uid));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  // Process bookings to get service history for the selected vehicle
  const processedServiceHistory = useMemo(() => {
    return bookings
      .filter(booking => 
        booking.selectedVehicle?.numberPlate === vehicle.numberPlate
      )
      .map(booking => {
        // Determining status based on boolean flags
        let status = 'pending';
        if (booking.isCompleted) status = 'completed';
        if (booking.isOngoing) status = 'ongoing';
        if (booking.isPending) status = 'pending';

        return {
          date: booking.selectedDate,
          time: booking.selectedTime,
          status: status,
          services: booking.selectedServices,
          bookingId: booking.id,
          paymentMethod: booking.selectedPayment,
          price: booking.price,
          deliveryDate: booking.deliveryDate,
          garageName: booking.garageName, 
          garageLocation: booking.garageLocation
        };
      });
  }, [bookings, vehicle.numberPlate]);

  // Filter services based on selected status
  const filteredServices = processedServiceHistory.filter(service => 
    selectedStatus === 'all' || service.status === selectedStatus
  );

  // Calculate statistics
   //use useMemo to optimize performance and only re-calculate when processedServiceHistory changes
  const stats = useMemo(() => ({
    total: processedServiceHistory.length,
    completed: processedServiceHistory.filter(s => s.status === 'completed').length,
    pending: processedServiceHistory.filter(s => s.status === 'pending').length
  }), [processedServiceHistory]);

  return (
    <div className="ModalOverlay">
      <div className="VehicleServiceHistory">
        <button className="CloseButton" onClick={onClose}>×</button>
        <div className="VehicleServiceHistory_Header">
          <div className="VehicleServiceHistory_Header_Left">
            <img 
              src={vehicle.imageUrl}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="VehicleServiceHistory_Image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/vehicles/default-car.png';
              }}
            />
            <div className="VehicleServiceHistory_Info">
              <h5>{vehicle.numberPlate}</h5>
              <p>{vehicle.make} {vehicle.model} ({vehicle.year})</p>
            </div>
          </div>
          <div className="VehicleServiceHistory_Stats">
            <div className="StatBox">
              <span className="StatNumber">{stats.total}</span>
              <span className="StatLabel">Total Services</span>
            </div>
            <div className="StatBox">
              <span className="StatNumber">{stats.completed}</span>
              <span className="StatLabel">Completed</span>
            </div>
            <div className="StatBox">
              <span className="StatNumber">{stats.pending}</span>
              <span className="StatLabel">Pending</span>
            </div>
          </div>
        </div>

        <div className="ServiceRecordsList">
          <div className="ServiceRecordsList_Header">
            <h4>Service History</h4>
            <div className="ServiceRecordsList_Filters">
              <select 
                className="StatusFilter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="ongoing">Ongoing</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {filteredServices.map((service, index) => (
            <div key={index} className={`ServiceRecord ServiceRecord--${service.status}`}>
              <div className="ServiceRecord_Header">
                <div className="ServiceRecord_Header_Left">
                  <span className="ServiceDate">
                    {new Date(service.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <span className="ServiceTime">Time: {service.time}</span>
                </div>
                <div className="ServiceRecord_Header_Right">
                  <span className={`StatusBadge StatusBadge--${service.status}`}>
                    {service.status}
                  </span>
                </div>
                <div className="GarageInfo">
                  <span className="GarageName">{service.garageName}</span>
                  <span className="GarageLocation">{service.garageLocation}</span>
                </div>
              </div>

              <div className="ServiceRecord_Details">
                <div className="ServicesList">
                  {service.services.map((svc, i) => (
                    <span key={i} className="ServiceTag">
                      <i className="fa-solid fa-wrench"></i>
                      <span>Service {i + 1}: {svc}</span>
                    </span>
                  ))}
                </div>
                
                <div className="ServiceRecord_Footer">
                  <div className="PaymentMethod">
                    <img 
                      src={getPaymentMethodIcon(service.paymentMethod)}
                      alt={service.paymentMethod}
                      className="PaymentMethod_Icon"
                    />
                    <span>Payment Method: {service.paymentMethod}</span>
                    {service.status !== 'pending' && (
                      <>
                        <span>Price: {service.price}</span>
                        <span>Delivery Date: {service.deliveryDate}</span>
                      </>
                    )}
                  </div>
                  <div className="ServiceID">
                    <i className="fas fa-hashtag"></i>
                    <span>Service ID: {service.bookingId}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredServices.length === 0 && (
            <div className="NoServices">
              <p>No service history found for this vehicle.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleServiceHistory;