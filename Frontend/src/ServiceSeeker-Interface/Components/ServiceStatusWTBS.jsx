//waiting to be serviced component
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserBookings, cancelBooking } from '../../Redux/Features/SharedSlices/Bookings/bookingSlice';
import { selectUserInfo } from '../../Redux/Features/SharedSlices/Users/userSlice';
import { createNotification } from '../../Redux/Features/SharedSlices/Bookings/notificationSlice';
import ConfirmationModal from './ConfirmationModal';
import styles from '../Modules/ServiceStatusWTBS.module.css';
import Loader from '../../Garage-Interface/Components/Loader';

function ServiceStatusWTBS({ selectedVehicle }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const dispatch = useDispatch();
    const userInfo = useSelector(selectUserInfo);
    const bookingRequests = useSelector((state) => state.booking.bookingRequests);
    const status = useSelector((state) => state.booking.status);
    useEffect(() => {
        if (userInfo?.user_id || userInfo?.uid) {
            dispatch(fetchUserBookings(userInfo.user_id || userInfo.uid));
        }
    }, [dispatch, userInfo]);
//function to handle cancel booking(opens the modal)
    const handleCancelBooking = (bookingId) => {
        setSelectedBookingId(bookingId);
        setIsModalOpen(true);
        
    };
//function to cancel the booking
    const handleConfirmCancel = async () => {
        try {
            const booking = bookingRequests.find(b => b.id === selectedBookingId);
            await dispatch(cancelBooking(selectedBookingId)).unwrap();
            
            // Create notification for the garage
            if (booking.garageId) {  
                dispatch(createNotification({
                    recipientId: booking.garageId, 
                    type: 'BOOKING_CANCELLED',
                    message: `Booking has been cancelled by ${userInfo.first_name} ${userInfo.last_name}`,
                    timestamp: new Date().toISOString(),
                    isRead: false,
                    bookingId: selectedBookingId,
                    senderType: 'serviceSeeker', 
                    additionalData: {
                        first_name: userInfo.first_name,
                        last_name: userInfo.last_name,
                        services: booking.selectedServices,
                        date: booking.selectedDate
                    }
                }));
            }
            
            // Refresh the bookings
            if (userInfo?.user_id || userInfo?.uid) {
                dispatch(fetchUserBookings(userInfo.user_id || userInfo.uid));
            }
            
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('Failed to cancel booking. Please try again.');
        }
    };

    if (status === 'loading') {
        return <Loader />;
    }

    // Console.log to debug
    console.log('Selected Vehicle:', selectedVehicle);
    console.log('Booking Requests:', bookingRequests);

    // Modify the filtering logic to check vehicle match AND strictly pending status
    const filteredServices = bookingRequests.filter((service) => {
        const vehicleMatch = 
            service.selectedVehicle?.numberPlate === selectedVehicle?.numberPlate ||
            service.vehicleId === selectedVehicle?.id;
    
        const isPending = service.isPending === true && 
                         !service.isOngoing && 
                         !service.isCompleted;
        
        return vehicleMatch && isPending;
    });

    // Console.log to see filtered results
    console.log('Filtered Services:', filteredServices);

    return (
        <div className={styles.container}>
            <ConfirmationModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmCancel}
                title="Cancel Booking"
                message="Are you sure you want to cancel this booking? There is no going back!"
            />
            {filteredServices.length === 0 ? (
                <p className={styles.noBookings}>No pending bookings available.</p>
            ) : (
                <ul className={styles.bookingList}>
                    {filteredServices.map((booking) => (
                        <li key={booking.id} className={styles.bookingItem}>
                            <div className={styles.contentWrapper}>
                                <img 
                                    className={styles.vehicleImage}
                                    src={booking.selectedVehicle?.imageUrl || "default-image-url"} 
                                    alt={`${booking.selectedVehicle?.model}`} 
                                />
                                <div className={styles.bookingDetails}>
                                    <div className={styles.detailRow}>
                                        <span className={styles.label}>Garage Name:</span>
                                        <span className={styles.value}>{booking.garageName}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.label}>Service ID:</span>
                                        <span className={styles.value}>{booking.id}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.label}>Selected Services:</span>
                                        <span className={styles.value}>{booking.selectedServices?.join(', ')}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.label}>Order Date:</span>
                                        <span className={styles.value}>{booking.selectedDate}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.label}>Order Time:</span>
                                        <span className={styles.value}>{booking.selectedTime}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.label}>Model:</span>
                                        <span className={styles.value}>{booking.selectedVehicle?.model}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.label}>Make:</span>
                                        <span className={styles.value}>{booking.selectedVehicle?.make}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.label}>Year:</span>
                                        <span className={styles.value}>{booking.selectedVehicle?.year}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.label}>Number Plate:</span>
                                        <span className={styles.value}>{booking.selectedVehicle?.numberPlate}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.label}>Status:</span>
                                        <span className={styles.statusPending}>Pending</span>
                                    </div>
                                </div>
                                
                            </div>
                            <button 
                                className={styles.cancelButton}
                                onClick={(e) => {
                                    e.stopPropagation();  // added to stop event bubbling
                                    handleCancelBooking(booking.id);
                                }}
                                type="button"
                                disabled={false}
                                style={{ cursor: 'pointer' }}
                            >
                                Cancel Booking
                            </button>
                        </li>
                    ))}
                </ul>
                
            )}
            
        </div>
    );
}

export default ServiceStatusWTBS
