import React, { useState } from "react";
import { useNavigate, Link, NavLink } from "react-router-dom";
import "./Homepage.css";
import "./contact-us.css";
import emailjs from '@emailjs/browser';

function ContactUs() {
  const navigate = useNavigate();
  const [formStatus, setFormStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('sending');

    const templateParams = {
      from_name: e.target.name.value,
      from_email: e.target.email.value,
      subject: e.target.subject.value,
      message: e.target.message.value,
      to_email: 'carguyswebapplication@gmail.com'
    };

    try {
      await emailjs.send(
        'service_oepzo78',
        'template_s08wlmy',
        templateParams,
        'WusaiJBfsSAwBTaJ_'
      );
      setFormStatus('success');
      e.target.reset();
    } catch (error) {
      console.error('Failed to send email:', error);
      setFormStatus('error');
    }
  };

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
      
      <main className="main-content contact-us-content">
        <h1>Contact Us</h1>
        <div className="contact-container">
          <div className="contact-info">
            <h2>Get in Touch</h2>
            <p>Have a question or need assistance? We're here to help!</p>
            <ul>
              <li><strong>Email:</strong> carguyswebapplication@gmail.com</li>
              
            </ul>
            <h3 className="hours-title">Hours of Operation</h3>
            <p>Monday - Friday: 8:00 AM - 8:00 PM<br />
            Saturday: 9:00 AM - 5:00 PM<br />
            Sunday: Closed</p>
          </div>
          <div className="contact-form">
            <h2>Send Us a Message</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input type="text" id="name" name="name" required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" required />
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject:</label>
                <input type="text" id="subject" name="subject" required />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message:</label>
                <textarea id="message" name="message" required></textarea>
              </div>
              <button type="submit" className="submit-btn" disabled={formStatus === 'sending'}>
                {formStatus === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
              {formStatus === 'success' && (
                <p className="success-message">Message sent successfully!</p>
              )}
              {formStatus === 'error' && (
                <p className="error-message">Failed to send message. Please try again.</p>
              )}
            </form>
          </div>
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

export default ContactUs;