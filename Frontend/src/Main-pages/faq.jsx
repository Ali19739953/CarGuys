import React from "react";
import { useNavigate, Link, NavLink } from "react-router-dom";
import "./Homepage.css";
import "./faq.css";
import { motion } from "framer-motion";

function FAQ() {
  const navigate = useNavigate();

  return (
    <div className="App">
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
      
      <main className="main-content faq-content">
        <motion.h1 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Frequently Asked Questions
        </motion.h1>
        <div className="faq-list">
          <motion.div 
            className="faq-item"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>How does CarGuys work?</h2>
            <p>CarGuys is a platform that connects car owners with trusted local garages. You can easily book services, track your car's maintenance history, and receive personalized recommendations all in one place.</p>
          </motion.div>
          <motion.div 
            className="faq-item"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2>How do I book a service through CarGuys?</h2>
            <p>Booking a service is simple. Just log in to your account, select the type of service you need, choose a convenient date and time, and pick a garage from our list of trusted partners. You'll receive a confirmation once your booking is complete.</p>
          </motion.div>
          <motion.div 
            className="faq-item"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2>What types of services can I book through CarGuys?</h2>
            <p>You can book a wide range of services including routine maintenance, repairs, inspections, and emergency services. Our platform covers everything from oil changes and tire rotations to more complex engine repairs.</p>
          </motion.div>
          <motion.div 
            className="faq-item"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2>How do you ensure the quality of garages on your platform?</h2>
            <p>We carefully vet all garages before partnering with them. We check their credentials, customer reviews, and service quality. We also continuously monitor customer feedback to ensure ongoing high-quality service.</p>
          </motion.div>
          <motion.div 
            className="faq-item"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h2>What if I'm not satisfied with the service I received?</h2>
            <p>Customer satisfaction is our top priority. If you're not happy with a service, please contact our customer support team. We'll work with you and the garage to resolve any issues and ensure you're satisfied with the outcome.</p>
          </motion.div>
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

export default FAQ;