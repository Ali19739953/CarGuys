//Ongoing services component
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserBookings } from '../../Redux/Features/SharedSlices/Bookings/bookingSlice';
import { selectUserInfo } from '../../Redux/Features/SharedSlices/Users/userSlice';
import styles from '../Modules/ServiceStatusONS.module.css';
import Loader from '../../Garage-Interface/Components/Loader';

function ServiceStatusONS({ selectedVehicle }) {
    const dispatch = useDispatch();
    const userInfo = useSelector(selectUserInfo);
    const bookingRequests = useSelector((state) => state.booking.bookingRequests);
    const status = useSelector((state) => state.booking.status);

    useEffect(() => {
        if (userInfo?.user_id || userInfo?.uid) {
            dispatch(fetchUserBookings(userInfo.user_id || userInfo.uid));
        }
    }, [dispatch, userInfo]);

    if (status === 'loading') {
        return <Loader />;
    }

    console.log('Selected Vehicle:', selectedVehicle);
    console.log('Booking Requests:', bookingRequests);

    // Filter for ongoing services
    const filteredServices = bookingRequests.filter((service) => {
        const matchesVehicle = service.selectedVehicle?.numberPlate === selectedVehicle?.numberPlate ||
                              service.vehicleId === selectedVehicle?.id;
        return matchesVehicle && service.isOngoing;
    });

    console.log('Filtered Ongoing Services:', filteredServices);

    return (
        <div className={styles.container}>
            {filteredServices.length === 0 ? (
                <p className={styles.noBookings}>No ongoing services available.</p>
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
                                        <span className={styles.statusOngoing}>Ongoing</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.label}>Quoted Price:</span>
                                        <span className={styles.value}>AED {booking.price}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.label}>Estimated Delivery:</span>
                                        <span className={styles.value}>{booking.deliveryDate}</span>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ServiceStatusONS;
