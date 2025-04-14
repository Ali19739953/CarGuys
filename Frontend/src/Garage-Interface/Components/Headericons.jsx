//used redux to logout
//implemented firebase logout
//imported logout from redux
//implemented signout function
import { useDispatch, useSelector } from 'react-redux';
import { logout,selectIsAuthenticated } from '../../Redux/Features/SharedSlices/Users/userSlice';
import { auth } from '../../../src/firebaseConfig';
import React, { useState, useEffect } from "react";
import styles from "../Modules/Headericons.module.css";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../Components/Loader";  
import { fetchNotifications,setupNotificationListener } from '../../Redux/Features/SharedSlices/Bookings/notificationSlice';
import NotificationDropdown from '../../Main-Components/NotificationDropdown';
import { firestore } from '../../../src/firebaseConfig';


function Headericons({ WelcomeText, GarageName, Title}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [localNotifications, setLocalNotifications] = useState([]);
  
  const userInfo = useSelector(state => state.user.userInfo);
  const garageId = userInfo?.user_id || userInfo?.uid;
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  // Initialize component
  useEffect(() => {
    // Set a short timeout to allow Firebase to initialize
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Reduce loading time to 1 second

    return () => clearTimeout(timer);
  }, []);

  // Set up notification listener
  useEffect(() => {
    let unsubscribe;
    
    if (garageId) {
      console.log('Setting up notification listener for:', garageId);
      
      try {
        unsubscribe = firestore.collection("Notifications")
          .where("recipientId", "==", garageId)
          .orderBy("timestamp", "desc")
          .onSnapshot(
            (snapshot) => {
              const newNotifications = [];
              snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                  newNotifications.push({
                    id: change.doc.id,
                    ...change.doc.data()
                  });
                }
              });
              
              if (newNotifications.length > 0) {
                setLocalNotifications(prev => [...newNotifications, ...prev]);
              }
              setIsLoading(false); // Make sure to set loading to false after getting notifications
            },
            (error) => {
              console.error("Error in notification listener:", error);
              setIsLoading(false); // Set loading to false even if there's an error
            }
          );
      } catch (error) {
        console.error("Error setting up notification listener:", error);
        setIsLoading(false); // Set loading to false if setup fails
      }
    } else {
      setIsLoading(false); // Set loading to false if there's no garageId
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [garageId]);

  // Calculate unread count from local state
  const unreadCount = localNotifications.filter(n => !n.isRead).length;
  const bookingRequests = useSelector((state) => state.booking.bookingRequests);
  const newBookingCount = bookingRequests.filter(request => request.isPending).length;

  // Event handlers
  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleNotiClick = () => {
    console.log("Notification icon clicked");
  };

  const handlePowerClick = async () => {
    try {
      if (!GarageName) {
        alert("Signing Out");
      } else {
        alert(`Signing Out ${GarageName}`);
      }

      await auth.signOut();
      dispatch(logout());
      navigate("/Homepage");
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Error signing out. Please try again.");
    }
  };

  const renderNotificationBadge = () => {
    if (unreadCount > 0) {
      return <span className={styles.notificationBadge}>{unreadCount}</span>;
    }
    return null;
  };

  if (isLoading) {
    return <Loader/>;
  }

  return (
    <>
      <section className={styles.HeaderIconsHeader}>
        <div className={styles.messageSection}>
          <h1 className={styles.WelcomeText}>
          {Title} {WelcomeText} {GarageName} 
          </h1>
        </div>

        <div className={styles.iconsSection}>
          <Link to="/GarageSettings" className={styles.icon}>
            <span>
              <img
                src="/icon/settings.png"
                alt="Settings"
                className={styles.SettImg}
              />
            </span>
          </Link>

          <span className={styles.icon} onClick={handleBellClick}>
            <img
              src="/icon/bell.png"
              alt="Notifications Bell"
              className={styles.bellImg}
            />
            {renderNotificationBadge()}
          </span>

          {showNotifications && localNotifications.length > 0 ? (
            <NotificationDropdown
              recipientId={garageId}
              notifications={localNotifications}
              onClose={() => setShowNotifications(false)}
              onNotificationRead={(notificationId) => {
                // Update local state when notification is read
                setLocalNotifications(prev =>
                  prev.map(n =>
                    n.id === notificationId ? { ...n, isRead: true } : n
                  )
                );
              }}
              userType="garage"
            />
          ) : showNotifications && (
            <div className={styles.emptyNotifications}>
              No notifications
            </div>
          )}

          <span className={styles.icon} onClick={handleNotiClick}>
            <img
              src="/icon/noti.png"
              alt="User Notifications"
              className={styles.notiImg}
            />
          </span>

          <span className={styles.icon} onClick={handlePowerClick}>
            <img
              src="/icon/poweroff.png"
              alt="Power Off"
              className={styles.powerImg}
            />
          </span>
        </div>
      </section>
    </>
  );
}

export default Headericons;
