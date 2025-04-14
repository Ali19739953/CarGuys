import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserBookings } from '../../Redux/Features/SharedSlices/Bookings/bookingSlice';
import { selectUserInfo } from '../../Redux/Features/SharedSlices/Users/userSlice';
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { firestore } from '../../firebaseConfig';
import { FaStar } from 'react-icons/fa';
import styles from '../Modules/ServiceStatusCS.module.css';
import Loader from '../../Garage-Interface/Components/Loader';

function ServiceStatusCS({ selectedVehicle }) {
    const dispatch = useDispatch();
    const userInfo = useSelector(selectUserInfo);
    const bookingRequests = useSelector((state) => state.booking.bookingRequests);
    const status = useSelector((state) => state.booking.status);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewData, setReviewData] = useState({
        rating: 0,
        comment: '',
        currentBooking: null
    });
    const [hover, setHover] = useState(null);
    const [reviewedServices, setReviewedServices] = useState(new Set());

    useEffect(() => {
        if (userInfo?.user_id || userInfo?.uid) {
            dispatch(fetchUserBookings(userInfo.user_id || userInfo.uid));
        }
    }, [dispatch, userInfo]);
//function to fetch the reviews from the database
    useEffect(() => {
        const fetchExistingReviews = async () => {
            if (!userInfo?.user_id && !userInfo?.uid) return;
            
            try {
                const reviewsSnapshot = await firestore
                    .collection('GarageDetails')
                    .get();
                
                const reviewedServiceIds = new Set();
                
                reviewsSnapshot.forEach(doc => {
                    const reviews = doc.data().reviews || [];
                    reviews.forEach(review => {
                        if (review.userId === (userInfo.user_id || userInfo.uid)) {
                            reviewedServiceIds.add(review.serviceId);
                        }
                    });
                });
                
                setReviewedServices(reviewedServiceIds);
            } catch (error) {
                console.error('Error fetching existing reviews:', error);
            }
        };

        fetchExistingReviews();
    }, [userInfo]);

    // Star Rating Component
    const StarRating = () => {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                {[...Array(5)].map((star, index) => {
                    const ratingValue = index + 1;
                    return (
                        <label key={index} style={{ cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="rating"
                                value={ratingValue}
                                style={{ display: 'none' }}
                                onClick={() => setReviewData(prev => ({
                                    ...prev,
                                    rating: ratingValue
                                }))}
                            />
                            <FaStar
                                size={30}
                                color={ratingValue <= (hover || reviewData.rating) ? "#ffc107" : "#e4e5e9"}
                                onMouseEnter={() => setHover(ratingValue)}
                                onMouseLeave={() => setHover(null)}
                                style={{ transition: 'color 200ms' }}
                            />
                        </label>
                    );
                })}
                <span style={{ marginLeft: '10px', fontSize: '18px' }}>
                    {reviewData.rating} of 5
                </span>
            </div>
        );
    };

    const handleSubmitReview = async () => {
        if (reviewedServices.has(reviewData.currentBooking.id)) {
            alert('You have already reviewed this service');
            setIsReviewModalOpen(false);
            return;
        }
        if (reviewData.rating === 0) {
            alert('Please select a rating');
            return;
        }
        if (!reviewData.comment.trim()) {
            alert('Please enter a review comment');
            return;
        }

        try {
            console.log('Current Booking Data:', reviewData.currentBooking);
            console.log('Garage ID:', reviewData.currentBooking?.garageId);
            
            if (!reviewData.currentBooking?.garageId) {
                throw new Error('Invalid garage ID');
            }

            const garageRef = firestore.collection('GarageDetails').doc(reviewData.currentBooking.garageId);
            
            // First check if the document exists
            const garageDoc = await garageRef.get();
            if (!garageDoc.exists) {
                throw new Error('Garage not found');
            }

            // Create the review object
            const reviewObject = {
                userId: userInfo.user_id || userInfo.uid,
                userName: userInfo.first_name && userInfo.last_name 
                    ? `${userInfo.first_name} ${userInfo.last_name}`
                    : 'Anonymous',
                rating: reviewData.rating,
                comment: reviewData.comment.trim(),
                serviceId: reviewData.currentBooking.id,
                timestamp: new Date().toISOString(),
                date: new Date().toLocaleString(),
                vehicleInfo: {
                    make: reviewData.currentBooking.selectedVehicle?.make || '',
                    model: reviewData.currentBooking.selectedVehicle?.model || '',
                    year: reviewData.currentBooking.selectedVehicle?.year || '',
                    numberPlate: reviewData.currentBooking.selectedVehicle?.numberPlate || '',
                    ImageUrl: reviewData.currentBooking.selectedVehicle?.imageUrl || ''
                }
            };

            // Create notification for the garage
            const notificationData = {
                recipientId: reviewData.currentBooking.garageId,
                type: 'NEW_REVIEW',
                message: `New ${reviewData.rating}-star review from ${reviewObject.userName}`,
                timestamp: Date.now(),
                isRead: false,
                additionalData: {
                    rating: reviewData.rating,
                    comment: reviewData.comment.trim(),
                    serviceId: reviewData.currentBooking.id,
                    vehicleInfo: reviewObject.vehicleInfo,
                    userName: reviewObject.userName,
                    reviewDate: Date.now()
                },
                senderId: userInfo.user_id || userInfo.uid,
                senderName: reviewObject.userName,
                status: 'unread',
                date: new Date().toLocaleString()
            };

            // Use batch write to ensure both operations succeed or fail together
            const batch = firestore.batch();

            // Add review to garage document
            if (!garageDoc.data().reviews) {
                batch.set(garageRef, { reviews: [reviewObject] }, { merge: true });
            } else {
                batch.update(garageRef, {
                    reviews: firebase.firestore.FieldValue.arrayUnion(reviewObject)
                });
            }

            // Create notification document
            const notificationRef = firestore.collection('Notifications').doc();
            batch.set(notificationRef, notificationData);

            // Commit the batch
            await batch.commit();

            setReviewData({
                rating: 0,
                comment: '',
                currentBooking: null
            });
            setIsReviewModalOpen(false);
            alert('Thank you for your review!');
        } catch (error) {
            console.error('Error submitting review:', error);
            alert(`Failed to submit review: ${error.message}`);
        }
    };

    if (status === 'loading') {
        return <Loader />;
    }

    // Filter for completed services
    const filteredServices = bookingRequests.filter((service) => {
        const matchesVehicle = service.selectedVehicle?.numberPlate === selectedVehicle?.numberPlate ||
                              service.vehicleId === selectedVehicle?.id;
        return matchesVehicle && service.isCompleted;
    });

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Your Completed Services</h2>
            {filteredServices.length === 0 ? (
                <p className={styles.noBookings}>No completed services available.</p>
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
                                        <span className={styles.label}>Delivery Date:</span>
                                        <span className={styles.value}>{booking.deliveryDate}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.label}>Price:</span>
                                        <span className={styles.value}>AED {booking.price}</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.label}>Status:</span>
                                        <span className={styles.statusCompleted}>Completed</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                className={styles.reviewButton}
                                onClick={() => {
                                    setReviewData(prev => ({
                                        ...prev,
                                        currentBooking: booking
                                    }));
                                    setIsReviewModalOpen(true);
                                }}
                            >
                                Review Service
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {/* Review Modal */}
            {isReviewModalOpen && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div className="modal-content" style={{
                        background: 'linear-gradient(90deg, rgba(255, 165, 0, 0.20) 0%, rgba(255, 165, 0, 0.03) 100%)',
                        padding: '30px',
                      backgroundColor:'#111',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '500px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>
                            Rate Your Experience
                        </h2>
                        
                        <div style={{ marginBottom: '25px', textAlign: 'center' }}>
                            <StarRating />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'white' }}>
                                <h4>Your Review:</h4>
                            </label>
                            <textarea
                                value={reviewData.comment}
                                onChange={(e) => setReviewData(prev => ({
                                    ...prev,
                                    comment: e.target.value
                                }))}
                                placeholder="Share your experience with this service..."
                                rows="4"
                                style={{
                                    width: '100%',
                                    padding: '5px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    resize: 'none',
                                    minHeight: '100px',
                                    background: 'linear-gradient(90deg, rgba(255, 165, 0, 0.20) 0%, rgba(255, 165, 0, 0.03) 100%)',
                                   color:'white',
                                  backgroundColor:'#111'
                                    
                                }}
                            />
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '10px',
                            marginTop: '20px'
                        }}>
                            <button
                                onClick={() => setIsReviewModalOpen(false)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: '1px solid #ddd',
                                    backgroundColor: '#fff',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitReview}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                Submit Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ServiceStatusCS;