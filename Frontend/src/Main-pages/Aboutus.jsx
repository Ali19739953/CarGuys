import React from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "./Homepage.css";
import "./about-us.css";
import { motion } from "framer-motion";

function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="HomepageContainer">
      <main className="HomepageMain">
        <header className="HomepageHeaderNav">
          <div className="HomepageHeaderNavLogo">
            <img src="/public/logo.png" alt="CarGuys Logo" />
          </div>
          <nav className="HomepageHeaderNavigation_custom">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "NavLink_custom navLinkActive_custom" : "NavLink_custom navLinkInactive_custom"
              }
            >
              Home
            </NavLink>
            <span className="HomepageNavbarDivider">|</span>
            <NavLink
              to="/Aboutus"
              className={({ isActive }) =>
                isActive ? "NavLink_custom navLinkActive_custom" : "NavLink_custom navLinkInactive_custom"
              }
            >
              About Us
            </NavLink>
            <span className="HomepageNavbarDivider">|</span>
            <NavLink
              to="/faq"
              className={({ isActive }) =>
                isActive ? "NavLink_custom navLinkActive_custom" : "NavLink_custom navLinkInactive_custom"
              }
            >
              FAQ
            </NavLink>
            <span className="HomepageNavbarDivider">|</span>
            <NavLink
              to="/contact-us"
              className={({ isActive }) =>
                isActive ? "NavLink_custom navLinkActive_custom" : "NavLink_custom navLinkInactive_custom"
              }
            >
              Contact Us
            </NavLink>
          </nav>

          <div className="HomepageNavbarbuttons">
            <button className="HomepageNavbarbuttons_btn_login"  onClick={() => navigate("/login")}>
              Login
            </button>
            <button className="HomepageNavbarbuttons_btn_signup" onClick={() => navigate("/signup")}>
              Signup
            </button>
            <button className="HomepageNavbarbuttons_btn_registerGarage" onClick={() => navigate("/SignupGarage")}>
              Partner with CarGuys
            </button>
          </div>
        </header>
        
        <div className="about-us-wrapper">
          <motion.h1 
            className="about-us-title"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            On-The-Go Repairs, Anytime, Anywhere
          </motion.h1>
          
          <motion.section 
            className="about-section"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 id="mission">Our Mission</h2>
            <p id="vision">At CarGuys, we're on a mission to revolutionize the car maintenance and repair experience. We understand how overwhelming it can be to keep track of car services and repairs. That's why we've built a platform that seamlessly connects car owners with trusted garages, simplifying the entire process from finding a reliable workshop to booking appointments and managing your vehicle's maintenance history.</p>
          </motion.section>
          
          <motion.section 
            className="about-section"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 >What We Do</h2>
            <p id="watwedo">CarGuys offers a comprehensive solution for all your vehicle needs:</p>
            <ul className="wedo">
              <li><strong>For Car Owners:</strong> We help you find local, trusted garages based on your location, service requirements, and budget. Our easy-to-use booking system allows you to schedule services, track your vehicle's service history, and get personalized repair recommendations using our AI-ChatBot.</li>
              <li><strong>For Garage Owners:</strong> We provide a powerful management tool that helps you streamline your operations, attract new customers, and improve service efficiency. With CarGuys, you can manage bookings, communicate with clients, and grow your business effortlessly.</li>
            </ul>
          </motion.section>
          
          <motion.section 
            className="about-section"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Why Choose CarGuys?</h2>
            <ul className="choose">
              <li><strong>Reliable Network:</strong> We partner only with trusted, top-rated garages and local garages to ensure your car is in good hands.</li>
              <li><strong>Convenience:</strong> Say goodbye to endless phone calls and paperwork. With CarGuys, everything you need is just a few clicks away.</li>
              <li><strong>Transparency:</strong> We believe in clear communication. You'll always know what services you're getting and how much they'll cost before any work begins.</li>
              <li><strong>Personalized Care:</strong> From maintenance reminders to tailored service recommendations, we're here to help you take the best care of your vehicle.</li>
            </ul>
          </motion.section>
          
          <motion.section 
            className="about-section"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Our Vision</h2>
            <p>We envision a world where car care is no longer a source of stress or uncertainty. With CarGuys, we're working towards a future where every car owner has access to quality, affordable, and convenient automotive services, and where every garage has the opportunity to thrive in a connected, digital ecosystem.</p>
          </motion.section>
        </div>
      </main>
      
      <footer className="HomepageFooter">
        <div className="HomepageFootercontent">
          <h1>CarGuys</h1>
          <div className="HomepageFootercontent_middle">
            <p>Trust CarGuys with your vehicle. From pickup to delivery at your doorstep, we’ve got you covered every step of the way. Stranded on the road? No problem! Easily find and select a nearby garage at your location with just a few clicks. Whether you need routine maintenance or emergency repairs, CarGuys connects you with top-rated garages and expert services to get you back on the road quickly and safely.</p>

          </div>
          <hr />
          <p>© 2024 CarGuys. All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
}

export default AboutUs;