import React, { useCallback, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import styles from "../Modules/GarageNavbar.module.css";
import GarageUsers from "../../api/garageUsers";
import { selectUserInfo, setUserData } from "../../Redux/Features/SharedSlices/Users/userSlice";
function GarageNavbar() {
  const dispatch = useDispatch();
  const userInfo = useSelector(selectUserInfo);

  const fetchData = useCallback(async () => {
    try {
      const result = await GarageUsers();
      dispatch(setUserData(result.garageData));
    } catch (error) {
      console.error("Error fetching garage data:", error);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className={styles.navbar}>
      <div className={styles.sidebarHeader}>
        <button className={styles.profilePicBtn}>
          <img 
            src={userInfo?.profileImageUrl || "/profilepics-test/DBPF1.png"} 
            alt="Profile Picture" 
            style={{ width: '30px', height: '30px', objectFit: 'cover' }}
          />
        </button>
        <h3 className={styles.h3tag}>{userInfo?.garage_name || "Garage Name"}</h3>
      </div>
      <nav className={styles.sidebarMenu}>
        <ul>
          <li>
            <NavLink 
              to="/GarageDashboard" 
              className={({ isActive }) => isActive ? styles.activeLink : ''}
            >
              <span className={styles.linkText}>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/ManageGarageDetails" 
              className={({ isActive }) => isActive ? styles.activeLink : ''}
            >
              <span className={styles.linkText}>Manage Garage Details</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/CustomerManagement" 
              className={({ isActive }) => isActive ? styles.activeLink : ''}
            >
              <span className={styles.linkText}>Client Management</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/ManageOngoingservice" 
              className={({ isActive }) => isActive ? styles.activeLink : ''}
            >
              <span className={styles.linkText}>Ongoing Services</span>
            </NavLink>
          </li>
          {/* <li>
            <NavLink 
              to="/PendingServices" 
              className={({ isActive }) => isActive ? styles.activeLink : ''}
            >
              <span className={styles.linkText}>Pending Services</span>
            </NavLink>
          </li> */}
          <li>
            <NavLink 
              to="/CompletedServices" 
              className={({ isActive }) => isActive ? styles.activeLink : ''}
            >
              <span className={styles.linkText}>Completed Services</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/IncomingRequest" 
              className={({ isActive }) => isActive ? styles.activeLink : ''}
            >
              <span className={styles.linkText}>Incoming Requests</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/ClientReviews" 
              className={({ isActive }) => isActive ? styles.activeLink : ''}
            >
              <span className={styles.linkText}>Client Reviews</span>
            </NavLink>
          </li>
          {/* <li>
            <NavLink 
              to="/ServiceContracts" 
              className={({ isActive }) => isActive ? styles.activeLink : ''}
            >
              <span className={styles.linkText}>Service Contracts</span>
            </NavLink>
          </li> */}
          <li>
            <NavLink 
              to="/PaymentHistory" 
              className={({ isActive }) => isActive ? styles.activeLink : ''}
            >
              <span className={styles.linkText}>Payment History</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/ClientMessenger" 
              className={({ isActive }) => isActive ? styles.activeLink : ''}
            >
              <span className={styles.linkText}>Client Messenger</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default GarageNavbar;
