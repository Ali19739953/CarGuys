//use params for dynamic routing..will implement later.
//context api..later
//changed the whole structure and updated to the latest version, offers more customization.
import React, { useEffect } from "react";
import { createBrowserRouter, RouterProvider, Route } from "react-router-dom";
// import "bootstrap/dist/css/bootstrap.min.css";
import { useDispatch } from 'react-redux'; // Import useDispatch
import { logout, loginSuccess, setUserAuthenticated } from './Redux/Features/SharedSlices/Users/userSlice.js'; // Import actions
import { auth } from './firebaseConfig'; // Import Firebase auth

// Main pages here
import Homepage from "./Main-pages/Homepage.jsx";
import AboutUs from "./Main-pages/Aboutus.jsx";
import FAQ from "./Main-pages/faq.jsx";
import ContactUs from "./Main-pages/contact-us.jsx";
import Login from "./Main-pages/Login";
import ClientMessenger from "./Main-pages/ClientMessenger.jsx"
import ForgotPassword from "./Main-pages/ForgotPassword.jsx";
// Garage interface here
import GarageDashboard from "./Garage-Interface/Pages/GarageDashboard.jsx";
import CustomerManagement from "./Garage-Interface/Pages/CustomerManagement.jsx";
import GarageProfile from "./Garage-Interface/Pages/GarageProfile.jsx";
import PendingServices from "./Garage-Interface/Pages/PendingServices.jsx";
import ClientReviews from "./Garage-Interface/Pages/ClientReviews.jsx";
import ManageGarageDetails from "./Garage-Interface/Pages/ManageGarageDetails.jsx";
import PaymentHistory from "./Garage-Interface/Pages/PaymentHistory.jsx";
import IncomingRequest from "./Garage-Interface/Pages/IncomingRequest.jsx";
import GarageSettings from "./Garage-Interface/Pages/GarageSettings.jsx";
import CompletedServices from "./Garage-Interface/Pages/CompletedServices.jsx";
import ManageOngoingservice from "./Garage-Interface/Pages/ManageOngoingservice.jsx";
import ServiceContracts from "./Garage-Interface/Pages/ServiceContracts.jsx";
import Postservicecontractbuilder from "./Garage-Interface/Pages/Postservicecontractbuilder.jsx";
import Preservicecontractbuilder from "./Garage-Interface/Pages/Preservicecontractbuilder.jsx";
import SignupGarage from "./Garage-Interface/Pages/SignupGarage.jsx";
import NotFound from "./Garage-Interface/Components/NotFound.jsx";

// Service Seeker-Interface imports
import ServiceSeekerHomepage from "./ServiceSeeker-Interface/Pages/ServiceSeekerHomepage.jsx";
import BrowseGarage from "./ServiceSeeker-Interface/Pages/BrowseGarage.jsx";
import CarManagement from "./ServiceSeeker-Interface/Pages/CarManagement.jsx";
import ViewGarageDetails from "./ServiceSeeker-Interface/Pages/ViewGarageDetails.jsx";
import ServiceStatus from "./ServiceSeeker-Interface/Pages/ServiceStatus.jsx";
import Signup from "./ServiceSeeker-Interface/Pages/SignupServiceSeeker.jsx";
import AddVehicle from "./ServiceSeeker-Interface/Pages/AddVehicle.jsx";
import BookingService from "./ServiceSeeker-Interface/Components/BookingService.jsx";
import ServiceSeekerSettings from "./ServiceSeeker-Interface/Pages/ServiceSeekerSettings.jsx";


// Create browser router 
const router = createBrowserRouter([
  // Service Seeker-Interface 
  {
    path: "/ClientMessenger",
    element: <ClientMessenger />,
  },
  {
    path:"/MessengerSeeker",
    element: <ClientMessenger />
  },
  {
    path:"/ClientMessengerSeeker",
    element: <ClientMessenger />
  },
  {
    path: "/ServiceSeekerHomepage",
    element: <ServiceSeekerHomepage />,
  },
  {
    path: "/ServiceSeekerSettings",
    element: <ServiceSeekerSettings />,
  },
  {
    path: "/BrowseGarage",
    element: <BrowseGarage />,
  },
  {
    path: "/CarManagement",
    element: <CarManagement />,
  },
  {
    path: "/ViewGarageDetails/:garageId",
    element: <ViewGarageDetails />,
  },
  {
    path: "/ServiceStatus",
    element: <ServiceStatus />,
  },
  {
    path: "/Signup",
    element: <Signup />,
  },
  {
    path: "/AddVehicle",
    element: <AddVehicle />,
  },
  {
    path: "/BookingService/:garageId",
    element: <BookingService />,
  },
  // Routes for Garage-Interface
  {
    path: "/GarageDashboard",
    element: <GarageDashboard />,
  },
  {
    path: "/GarageProfile",
    element: <GarageProfile />,
  },
  {
    path: "/CustomerManagement",
    element: <CustomerManagement user="Hamza" user2="Borhan" user3="Anas" user4="Saad" />,
  },
  {
    path: "/PendingServices",
    element: <PendingServices />,
  },
  {
    path: "/ClientReviews",
    element: <ClientReviews />,
  },
  {
    path: "/ManageGarageDetails",
    element: <ManageGarageDetails />,
  },
  {
    path: "/ServiceContracts",
    element: <ServiceContracts />,
  },
  {
    path: "/PaymentHistory",
    element: <PaymentHistory />,
  },
  {
    path: "/IncomingRequest",
    element: <IncomingRequest />,
  },
  {
    path: "/GarageSettings",
    element: <GarageSettings />,
  },
  {
    path: "/CompletedServices",
    element: <CompletedServices />,
  },
  {
    path: "/Postservicecontractbuilder",
    element: <Postservicecontractbuilder />,
  },
  {
    path: "/ManageOngoingservice",
    element: <ManageOngoingservice />,
  },
  {
    path: "/Preservicecontractbuilder/:serviceId",
    element: <Preservicecontractbuilder />,
  },
  {
    path: "/SignupGarage",
    element: <SignupGarage />,
  },
  // Routes for main pages
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/ForgotPassword",
    element: <ForgotPassword />,
  },
  {
    path: "/Homepage",
    element: <Homepage />,
  },
  {
    path: "/",
    element: <Homepage />,
  },
  {
    path: "/Aboutus",  // Add this new route
    element: <AboutUs />,
  },
  {
    path: "/faq",  // Add this new route
    element: <FAQ />,
  },
  {
    path: "/contact-us",  // Add this new route
    element: <ContactUs />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  const dispatch = useDispatch(); // Initialize dispatch



  //NOT WORKKING PROPERLY, NEED TO FIX THIS.
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.ctrlKey) {
        case true:
          switch (event.key) {
            case 'h':
              window.location.href = "/Homepage"; // Navigate to homepage
              break;
            case 'f':
              window.location.href = "/faq"; // Open FAQs section
              break;
            case 's':
              window.location.href = "/Support"; // Navigate to Support
              break;
            case 'q':
              dispatch(logout()); // Dispatch logout action
              alert("Signing Out");
              window.location.href = "/";
              break;
            default:
              break;
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown); 
    };
  }, [dispatch]); // Add dispatch to dependency array

  return <RouterProvider router={router} />;
}

export default App;
