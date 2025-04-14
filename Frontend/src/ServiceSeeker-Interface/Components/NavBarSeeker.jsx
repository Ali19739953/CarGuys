//utilize the user slice to get the user info and the is authenticated state.
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { selectIsAuthenticated } from '../../Redux/Features/SharedSlices/Users/userSlice';
import { useSelector, useDispatch } from "react-redux";
import { selectUserInfo, setUserData } from "../../Redux/Features/SharedSlices/Users/userSlice";
import fetchServiceSeekerUserData from "../../api/serviceSeekerUsers";
// fetchServiceSeekerUserData is not used anymore but still the code is here,however there is an issue still that i am facing, when i reload the page the fetched/saved data in the store vanishes.
import styles from '../Modules/NavBarseeker.module.css';
function NavBarSeeker() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userInfo = useSelector(selectUserInfo);
  const [localUserInfo, setLocalUserInfo] = useState(null);
  const dispatch = useDispatch();
  console.log("User Infoheheh:", userInfo);
  console.log("Is Authenticated:", isAuthenticated);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { serviceSeekerData } = await fetchServiceSeekerUserData();
        if (serviceSeekerData) {
          dispatch(setUserData(serviceSeekerData));
          setLocalUserInfo(serviceSeekerData);
        }
      } catch (error) {
        console.error("Error fetching service seeker data:", error);
      }
    };

    fetchData();
  }, [dispatch]);

  console.log("Local User Info:", localUserInfo);

  return (
    <div className={styles.navbar}>
      <div className={styles.sidebarHeader}>
        <Link to="/ServiceSeekerSettings">
          <button className={styles.profilePicBtn}>
            <img 
              src={userInfo?.profilePicture || "/profilepics-test/DBPF1.png"}
              alt="Profile Picture" 
              style={{
                width: '40px',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
              }}
            />
          </button>
        </Link>
        <h3 className={styles.h3tag}>{userInfo?.first_name || "Loading..."}</h3>
      </div>
      <nav className={styles.sidebarMenu}>
        <ul>
          <li>
            <NavLink 
              to="/ServiceSeekerHomepage" 
              className={({ isActive }) => isActive ? styles.activeLink : ''}
            >
              <span className={styles.linkText}>Homepage</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/BrowseGarage" 
              className={({ isActive }) => isActive ? styles.activeLink : ''}
            >
              <span className={styles.linkText}>Browse Garages</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/ServiceStatus" 
              className={({ isActive }) => isActive ? styles.activeLink : ''}
            >
              <span className={styles.linkText}>Service Status</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/CarManagement" 
              className={({ isActive }) => isActive ? styles.activeLink : ''}
            >
              <span className={styles.linkText}>Car Management</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/MessengerSeeker" 
              className={({ isActive }) => isActive ? styles.activeLink : ''}
            >
              <span className={styles.linkText}>Messenger</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      <div>
        {/* <Link to="/ServiceSeekerSettings">
          <button>Settings</button>
        </Link> */}
      </div>
    </div>
  );
}

export default NavBarSeeker;
