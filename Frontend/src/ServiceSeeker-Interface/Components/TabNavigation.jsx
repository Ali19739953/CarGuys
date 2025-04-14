import React from 'react';
import styles from "../Modules/TabNavigation.module.css";

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'payment', label: 'Payment Methods' },
    { id: 'address', label: 'Address' },
  ];

  return (
    <nav className={styles.tabNavigation}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default TabNavigation;