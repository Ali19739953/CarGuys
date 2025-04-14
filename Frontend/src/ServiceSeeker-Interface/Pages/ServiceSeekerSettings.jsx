import React, { useState, useEffect } from 'react';
import "./ServiceSeekerSettings.css";
import HeadericonsSeeker from "../Components/HeaderIconSeeker";
import NavBarMobile from "../Components/NavBarMobile";
import NavBarSeeker from "../Components/NavBarSeeker";
import PaymentMethods from '../Components/PaymentMethods';
import Address from '../Components/Address';
import Profile from '../Components/Profile';

const ServiceSeekerSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <Profile />;
      case 'payment':
        return <PaymentMethods />;
      case 'address':
        return <Address />;
      default:
        return <div className="empty-state">Select a tab</div>;
    }
  };

  return (
    <div className="ServiceSeekerHomepageContainer">
      {isMobile ? <NavBarMobile /> : <NavBarSeeker />}

      <main className="ServiceSeekerHomepageMain">
        <header className="ServiceSeekerHomepageHeader">
          <HeadericonsSeeker Title={"Settings"} />
        </header>

        <div className="ServiceSeekerHomepageContent">
          <div className="settings-layout">
            <div className="settings-tabs">
              <button 
                className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                Profile
              </button>
              <button 
                className={`tab-button ${activeTab === 'address' ? 'active' : ''}`}
                onClick={() => setActiveTab('address')}
              >
                Addresses
              </button>
              <button 
                className={`tab-button ${activeTab === 'payment' ? 'active' : ''}`}
                onClick={() => setActiveTab('payment')}
              >
                Payment Methods
              </button>
            </div>

            <div className="settings-content">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServiceSeekerSettings;