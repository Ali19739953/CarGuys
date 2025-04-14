import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../Redux/Features/SharedSlices/Users/userSlice";
import { fetchNotifications, setupNotificationListener, markNotificationAsRead } from "../../Redux/Features/SharedSlices/Bookings/notificationSlice";
import { auth } from "../../firebaseConfig";
import styles from '../../ServiceSeeker-Interface/Modules/Headericonseeker.module.css';
import { Link, useNavigate } from "react-router-dom";
import { selectUserInfo } from "../../Redux/Features/SharedSlices/Users/userSlice";
import NotificationDropdown from "../../Main-Components/NotificationDropdown";

function HeadericonsSeeker({ WelcomeText, Title, UserName}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userInfo = useSelector(selectUserInfo);
  const notifications = useSelector(state => state.notifications.notifications);

  useEffect(() => {
    const userId = userInfo?.user_id || userInfo?.uid;
    console.log('Current user ID:', userId);

    if (userId) {
      dispatch(fetchNotifications({ 
        recipientId: userId, 
        userType: 'serviceSeeker' 
      }));
      
      const setupListener = setTimeout(() => {
        dispatch(setupNotificationListener({ 
          recipientId: userId, 
          userType: 'serviceSeeker' 
        }))
          .then((unsubscribeFunc) => {
            console.log('Notification listener setup for user:', userId);
            return () => {
              if (unsubscribeFunc) {
                unsubscribeFunc();
              }
            };
          });
      }, 3000);

      return () => {
        clearTimeout(setupListener);
      };
    }
  }, [dispatch, userInfo]);

  useEffect(() => {
    console.log('Current notifications:', notifications);
  }, [notifications]);

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleNotificationRead = async (notificationId) => {
    try {
      await dispatch(markNotificationAsRead(notificationId)).unwrap();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  const Seekerhandlepowerclick = async () => {
    try {
      setIsLoading(true);
      alert("Signing Out");
      await auth.signOut();
      dispatch(logout());
      navigate("/Homepage");
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Error signing out. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
//filter notifications based on type
  const filteredNotifications = notifications.filter(notification => 
    ['SERVICE_ONGOING', 'SERVICE_COMPLETED', 'SERVICE_REJECTED', 'CONTRACT_GENERATED', 'PAYMENT_REQUEST', 'COD_PICKUP_REMINDER'].includes(notification.type)
  );

  const unreadCount = filteredNotifications.filter(n => !n.isRead).length;

  return (
    <>
      <section className={styles.HeaderIconsHeader}>
        <div className={styles.messageSection}>
          <h1 className={styles.WelcomeText}>
            {WelcomeText} {UserName}
          </h1>
          <h1 className={styles.WelcomeText}>
            {Title}
          </h1>
        </div>

        <div className={styles.iconsSection}>
          <Link to="/ServiceSeekerSettings" className={styles.icon}>
            <span>
              <img
                src="/icon/settings.png"
                alt="Settings"
                className={styles.SettImg}
              />
            </span>
          </Link>
         
          <div className={styles.notificationWrapper}>
            <span className={styles.icon} onClick={handleBellClick}>
              <img
                src="/icon/bell.png"
                alt="Notifications Bell"
                className={styles.bellImg}
              />
              {unreadCount > 0 && (
                <span className={styles.notificationBadge}>
                  {unreadCount}
                </span>
              )}
            </span>
            {showNotifications && filteredNotifications.length > 0 ? (
              <NotificationDropdown
                recipientId={userInfo?.user_id || userInfo?.uid}
                notifications={filteredNotifications}
                onClose={() => setShowNotifications(false)}
                onNotificationRead={handleNotificationRead}
                userType="serviceSeeker"
              />
            ) : showNotifications && (
              <div className={styles.emptyNotifications}>
                No notifications
              </div>
            )}
          </div>
        
          <span className={styles.icon} >
            <img
              src="/icon/noti.png"
              alt="User Notifications"
              className={styles.notiImg}
            />
          </span>
          <span className={styles.icon} onClick={Seekerhandlepowerclick}>
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

export default HeadericonsSeeker;
