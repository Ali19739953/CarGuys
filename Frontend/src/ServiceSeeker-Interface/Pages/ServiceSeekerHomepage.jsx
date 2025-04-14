import React, { useState, useEffect } from "react";
import "./ServiceSeekerHomepage.css";
import { Link } from "react-router-dom";
import HeadericonsSeeker from "../Components/HeaderIconSeeker";
import NavBarMobile from "../Components/NavBarMobile";
import NavBarSeeker from "../Components/NavBarSeeker";
import { useSelector } from 'react-redux';
import { selectUserType, selectUserInfo } from "../../Redux/Features/SharedSlices/Users/userSlice";

function ServiceSeekerHomepage() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };
  const userType = useSelector(selectUserType);
  const userInfo = useSelector(selectUserInfo);

  console.log('User Type:', userType);
  console.log('User Info:', userInfo);
  
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  

  return (
    <div className="ServiceSeekerHomepageContainer">
      {isMobile ? <NavBarMobile /> : <NavBarSeeker />}
      
      <main className="ServiceSeekerHomepageMain">
        <header className="ServiceSeekerHomepageHeader">
          <HeadericonsSeeker Title={`Welcome`}/>
        </header>

        <div className="hero-section">
          <div className="hero-content">
            <h1>On The Go Repairs. Anytime, Anywhere</h1>
            <p>Whether you're at home, work, or on the road, The Car Guys brings trusted car garages to you, anytime, anywhere</p>
            <Link to="/BrowseGarage">
              <button className="book-now-btn">Book now</button>
            </Link>
          </div>
          <div className="hero-image">
            <img src="/homepagebanner.jpg" alt="Car repair garage" />
          </div>
        </div>

        <section className="features-section">
          <h2>Why choose our Platform</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <img src="/icon/tick.png" alt="Verified icon" />
              <h3>Verified Workshops</h3>
              <p>Quality assured service providers</p>
            </div>

            <div className="feature-card">
              <img src="/icon/star.png" alt="Best prices icon" />
              <h3>Best Prices</h3>
              <p>Competitive and transparent pricing</p>
            </div>

            <div className="feature-card">
              <img src="/icon/thunder.png" alt="Quick booking icon" />
              <h3>Quick Booking</h3>
              <p>Easy and fast appointment scheduling</p>
            </div>
          </div>

          <div className="feature-card support-card centered-card">
            <img src="/icon/telephone.png" alt="Support icon" />
            <h3>24/7 Support</h3>
            <p>Always here when you need us</p>
          </div>
        </section>

        <section className="cta-section">
          <h2>Ready to get started</h2>
          <p>Join thousands of satisfied customers</p>
          <Link to="/BrowseGarage">
            <button className="book-now-btn">Book now</button>
          </Link>
        </section>
      </main>
    </div>
  );
}

export default ServiceSeekerHomepage;