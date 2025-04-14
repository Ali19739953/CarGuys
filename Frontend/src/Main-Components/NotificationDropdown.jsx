import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { markNotificationAsRead } from '../Redux/Features/SharedSlices/Bookings/notificationSlice';
import styles from '../Main-Modules/NotificationDropdown.module.css';
import { firestore } from '../firebaseConfig';

const NotificationDropdown = ({ recipientId, notifications = [], onClose, onNotificationRead, userType }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Filtering notifications based on user type
  const filteredNotifications = notifications.filter(notification => {
    if (userType === 'serviceSeeker') {
      return ['SERVICE_ONGOING', 'SERVICE_COMPLETED', 'SERVICE_REJECTED', 'CONTRACT_GENERATED', 'PAYMENT_REQUEST', 'COD_PICKUP_REMINDER'].includes(notification.type);
    } else if (userType === 'garage') {
      return ['BOOKING_REQUEST', 'NEW_BOOKING_REQUEST', 'BOOKING_CANCELLED', 'NEW_REVIEW'].includes(notification.type);
    }
    return true; // If no userType specified, show all notifications
  });

  useEffect(() => {
    console.log('NotificationDropdown mounted with recipientId:', recipientId);
    console.log('Current notifications:', filteredNotifications);
  }, [recipientId, filteredNotifications]);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await firestore.collection("Notifications")
          .doc(notification.id)
          .update({ isRead: true });
        
        onNotificationRead(notification.id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'BOOKING_REQUEST':
      case 'NEW_BOOKING_REQUEST':
        navigate('/IncomingRequest');
        break;
      case 'SERVICE_STARTED':
      case 'SERVICE_COMPLETED':
        break;
      case 'BOOKING_REJECTED':
        break;
      case 'CONTRACT_GENERATED':
        if (notification.additionalData?.contractUrl) {
          const confirmDownload = window.confirm('Would you like to download the service agreement PDF?');
          if (confirmDownload) {
            try {
              const link = document.createElement('a');
              link.href = notification.additionalData.contractUrl;
              link.target = '_blank';
              link.download = `CarGuys_Service_Agreement_${notification.additionalData.bookingId}.pdf`;
              
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            } catch (error) {
              console.error('Error downloading contract:', error);
              alert('Error downloading the contract. Please try again.');
            }
          }
        }
        break;
      case 'PAYMENT_REQUEST':
        if (notification.additionalData?.paymentUrl) {
      
          window.open(notification.additionalData.paymentUrl, '_blank');
        }
        break;
      case 'COD_PICKUP_REMINDER':
        break;
      default:
        console.log('No navigation defined for this notification type:', notification.type);
    }
    
    onClose();
  };

  // Sort filtered notifications by timestamp
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  return (
    <div className={styles.dropdownContainer}>
      <div className={styles.dropdownHeader}>
        <h3>Notifications</h3>
        <button onClick={onClose}>×</button>
      </div>
      <div className={styles.notificationsList}>
        {sortedNotifications && sortedNotifications.length > 0 ? (
          sortedNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`${styles.notificationItem} ${!notification.isRead ? styles.unread : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <p className={styles.message}>{notification.message}</p>
              <small className={styles.timestamp}>
                {new Date(notification.timestamp).toLocaleString()}
              </small>
            </div>
          ))
        ) : (
          <div className={styles.noNotifications}>
            No notifications
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;