import React from "react";
import GarageNavbar from "../Components/GarageNavbar.jsx";
import Searchbar from "../Components/Searchbar.jsx";
// import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Mobileheader from "../Components/Mobileheader";
import Headericons from "../Components/Headericons";
import "./ServiceContract.css";
import { Link } from "react-router-dom";

function ServiceContracts() {
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

  const servicerequests = [
    {
      "service requested": "Car diagnosis, Oil Change",
      customername: "Albella sher",
      "Unique Service ID": "76432",
      "Car Number": "DXB A 87112",
      "Request Date": "27/01/23",
      "Request Time": "2:00PM",
      ImgUrl: "/profilepics-test/DBPF1.png",
    },
  ];

  return (
    
    <div className="ServiceContractsContainer">
      {isMobile ? <Mobileheader /> : <GarageNavbar />}{" "}

      <main className="ServiceContractsMain">

     <header className="ServiceContractsHeader">
          <Headericons Title={"Service Contracts"}/>
        </header>

      <div className="ServiceContractsSearchbar">

      <Searchbar />

      </div>

      <div className="ServiceContractsContent">

      <div className="ServiceContracts_PreServiceContractsSection">

        <div className="ServiceContracts_PreServiceContractsSection_Heading">
        <h2>Pre-Service Contracts</h2>
        </div>

        

          {servicerequests.map((service) => (
          
          <div key={service["Unique Service ID"]} className="ServiceContracts_PreServiceContracts_Item">

            <div className="ServiceContracts_PreServiceContracts_ImageAndName">
            <img src={service.ImgUrl} alt="Customer Profile" />
            <strong>{service.customername}</strong>
            </div>

            <div className="ServiceContracts_PreServiceContracts_Item_Fields">
            <p>Service Requested: {service["service requested"]}</p>
            <p>Car Number: {service["Car Number"]}</p>
            <p>Request Date: {service["Request Date"]}</p>
            <p>Request Time: {service["Request Time"]}</p>
            </div>

            <div className="ServiceContracts_PreServiceContracts_Item_Button">
              <Link to="/Preservicecontractbuilder" className="link">
            <button className="ServiceContracts_PreServiceContracts_Item_Button_B">Access pre-service contract</button>
            </Link>
            </div>

          </div>

          ))}

      </div>

      

      <div className="ServiceContracts_PostServiceContractsSection">

      <div className="ServiceContracts_PostServiceContractsSection_Heading">
        <h2>Post-Service Contracts</h2>
        </div>

        {servicerequests.map((service) => (
          <div key={service["Unique Service ID"]} className="ServiceContracts_PostServiceContracts_Item">

            <div className="ServiceContracts_PostServiceContracts_ImageAndName">
            <img src={service.ImgUrl} alt="Customer Profile" />
            <strong>{service.customername}</strong>
            </div>

            <div className="ServiceContracts_PostServiceContracts_Item_Fields">
            <p>Service Requested: {service["service requested"]}</p>
            <p>Car Number: {service["Car Number"]}</p>
            <p>Request Date: {service["Request Date"]}</p>
            <p>Request Time: {service["Request Time"]}</p>
            </div>

            <div className="ServiceContracts_PostServiceContracts_Item_Button">
            <Link to="/Postservicecontractbuilder" className="link">
            <button className="ServiceContracts_PostServiceContracts_Item_Button_B">Access post-service contract</button>
            </Link>
            </div>

          </div>
        ))}

      </div>

      </div>

      </main>

      </div>
    
  );
}

export default ServiceContracts;
