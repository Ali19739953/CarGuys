import React, { useState } from "react";
import GarageNavbar from "../Components/GarageNavbar";
import "./PendingServices.css";
import Headericons from "../Components/Headericons";
import { useEffect } from "react";
import Mobileheader from "../Components/Mobileheader";
import Searchbar from "../Components/Searchbar";
import { Link } from "react-router-dom";


function PendingServices() {
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
  // const [] = useState;
  let user = "Ali";
  let Servicetype = "idk";
  let ServiceType = "idk";
  let UniqueServiceID = "39012803192";
  let CarNumber = "DXB A 8071";
  let OrderDate = "001214";
  let ExpectedDelivery = "10/01/24";
  let Pricequoted = 500;
  let Location = "Al barsha 2 25.092193,55.32342";
  const PendingData = () => {
    const fetchData = [
      {
        "Service-Type": `${Servicetype}`,
        "Unique-Service-ID": `${UniqueServiceID}`,
        "Car-Number": `${CarNumber}`,
        "Order-Date": `${OrderDate}`,
        "Expected-Delivery-Date": `${ExpectedDelivery}`,
        "Price-quoted": `${Pricequoted}`,
        Location: `${Location}`,
      },
    ];
  };

return (
    
  <div className="PendingServicesContainer">
    {isMobile ? <Mobileheader /> : <GarageNavbar />}

    <main className="PendingServicesMain">

      <header className="PendingServicesHeader">
        <Headericons Title={"Pending Services"}/>
      </header>

      <div className="PendingServicesSearchbar">
        <Searchbar />
      </div>

      <div className="PendingServicesContent">

        <div className="PendingServicsItem">

          <div className="PendingServicesItem_Box">
            <div className="PendingServicesItem_Box_ImageAndName">
              <img src="/profilepics-test/DBPF1.png" alt="Profile Picture" />
              <strong>{user}</strong>
            </div>

            <div className="PendingServicesItem_Box_Fields">  
              <div>{Location}</div>
              <div>Service Type: {ServiceType}</div>
              <div>UniqueServiceID:{UniqueServiceID}</div>
              <div>CarNumber: {CarNumber}</div>
              <div>OrderDate: {OrderDate}</div>
              <div>ExpectedDelivery: {ExpectedDelivery}</div>
              <div>Pricequoted: {Pricequoted}</div>
            </div>

            <div className="PendingServicesItem_Box_Button">
            <Link to="/Preservicecontractbuilder" className="link">
              <button className="PendingServicesItem_Box_Button_AccessPreServiceContract">Access pre-Service Contract</button>
              </Link>
              <button className="PendingServicesItem_Box_Button_MarkAsOngoing">Mark as Ongoing</button>
            </div>

          </div>

          <div className="PendingServicesItem_Box">
            <div className="PendingServicesItem_Box_ImageAndName">
              <img src="/profilepics-test/DBPF1.png" alt="Profile Picture" />
              <strong>{user}</strong>
            </div>

            <div className="PendingServicesItem_Box_Fields">  
              <div>{Location}</div>
              <div>Service Type: {ServiceType}</div>
              <div>UniqueServiceID:{UniqueServiceID}</div>
              <div>CarNumber: {CarNumber}</div>
              <div>OrderDate: {OrderDate}</div>
              <div>ExpectedDelivery: {ExpectedDelivery}</div>
              <div>Pricequoted: {Pricequoted}</div>
            </div>

            <div className="PendingServicesItem_Box_Button">
            <Link to="/Preservicecontractbuilder" className="link">
              <button className="PendingServicesItem_Box_Button_AccessPreServiceContract">Access pre-Service Contract</button>
              </Link>
              <button className="PendingServicesItem_Box_Button_MarkAsOngoing">Mark as Ongoing</button>
            </div>

          </div>

          <div className="PendingServicesItem_Box">
            <div className="PendingServicesItem_Box_ImageAndName">
              <img src="/profilepics-test/DBPF1.png" alt="Profile Picture" />
              <strong>{user}</strong>
            </div>

            <div className="PendingServicesItem_Box_Fields">  
              <div>{Location}</div>
              <div>Service Type: {ServiceType}</div>
              <div>UniqueServiceID:{UniqueServiceID}</div>
              <div>CarNumber: {CarNumber}</div>
              <div>OrderDate: {OrderDate}</div>
              <div>ExpectedDelivery: {ExpectedDelivery}</div>
              <div>Pricequoted: {Pricequoted}</div>
            </div>

            <div className="PendingServicesItem_Box_Button">
            <Link to="/Preservicecontractbuilder" className="link">
              <button className="PendingServicesItem_Box_Button_AccessPreServiceContract">Access pre-Service Contract</button>
              </Link>
              <button className="PendingServicesItem_Box_Button_MarkAsOngoing">Mark as Ongoing</button>
            </div>

          </div>

        </div>

      </div>
        
    </main>

  </div>
    
  );
}

export default PendingServices;
