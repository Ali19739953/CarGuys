import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUserInfo } from '../../Redux/Features/SharedSlices/Users/userSlice';
import styles from '../Modules/Profile.module.css';

const Profile = () => {
  const userInfo = useSelector(selectUserInfo);
  const [profile] = useState({
    first_name: userInfo?.first_name || 'No name available',
    last_name: userInfo?.last_name || '',
    email: userInfo?.email || 'No email available',
    contact_number: userInfo?.contact_number || '',
    profilePicture: userInfo?.profilePicture || null,
  });

  return (
    <div className={styles.profile}>
      <div className={styles.profileHeader}>
        <div className={styles.profileImageContainer}>
          <div 
            className={styles.profileImage}
            style={{ 
              backgroundImage: profile.profilePicture 
                ? `url(${profile.profilePicture})` 
                : 'none'
            }}
          >
            {!profile.profilePicture && (
              <div className={styles.imageInitials}>
                {profile.first_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <div className={styles.profileInfo}>
          <h2>{profile.first_name} {profile.last_name}</h2>
          <p>{profile.email}</p>
        </div>
      </div>

      <div className={styles.profileDetails}>
        {/* <div className={styles.profileField}>
          <label>First Name:</label>
          <input
            type="text"
            name="first_name"
            value={profile.first_name}
            disabled={true}
          />
        </div>
        
        <div className={styles.profileField}>
          <label>Last Name:</label>
          <input
            type="text"
            name="last_name"
            value={profile.last_name}
            disabled={true}
          />
        </div> */}
        
        <div className={styles.profileField}>
          <label>Contact Number:</label>
          <input
            type="tel"
            name="contact_number"
            value={profile.contact_number}
            disabled={true}
          />
        </div>

        <div className={styles.profileField}>
          <label>Email Address:</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            disabled={true}
          />
        </div>
      </div>
      <p className={styles.note}>Note: To edit your profile, please contact the support team.</p>
    </div>
  );
};

export default Profile;