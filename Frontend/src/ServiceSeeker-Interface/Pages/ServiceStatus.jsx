import HeaderSeeker from "../Components/NavBarSeeker";
import React, { useState, useEffect } from "react";
import HeadericonsSeeker from "../Components/HeaderIconSeeker";
import NavBarMobile from "../Components/NavBarMobile";
import "./ServiceStatus.css";
import VehicleSeletcBarServiceSeeker from "../Components/VehicleSelectBarServiceSeeker"
import ServiceStatusWTBS from "../Components/ServiceStatusWTBS";
import ServiceStatusONS from "../Components/ServiceStatusONS";
import ServiceStatusCS from "../Components/ServiceStatusCS";
import { selectSelectedVehicle } from '../../Redux/Features/SharedSlices/Vehicles/vehicleSlice';
import { useSelector } from 'react-redux';
import { selectUserInfo } from '../../Redux/Features/SharedSlices/Users/userSlice';

function ServiceStatus() {
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
  const selectedVehicle = useSelector(selectSelectedVehicle);
  const userInfo = useSelector(selectUserInfo);
  //let message =
   // "Data will be fetched from the backend. dont want to create the layout for no reason!";
  // let message1 = "the cars will be based on the user's saved cars.";
  const [value, setValue] = useState("WaitingtobeServiced");

  const renderComponent = () => {
    if(!userInfo){
      return <div><strong>Please login to view this page</strong></div>;
    }
    else{   
    switch (value) {
      case "WaitingtobeServiced":
        return <ServiceStatusWTBS selectedVehicle={selectedVehicle} />;
      case "OnGoingServices":
        return <ServiceStatusONS selectedVehicle={selectedVehicle} />;
      case "CompletedServices":
        return <ServiceStatusCS selectedVehicle={selectedVehicle} />;
      default:
        return null;
    }
  }
  };

  return (
    <div className="ServiceStatusContainer">
     {isMobile ? <NavBarMobile /> : <HeaderSeeker />}

      <main className="ServiceStatusMain">

        <header className="ServiceStatusHeader">
        <HeadericonsSeeker Title={"Service Status"}/>
        </header>

        {/* <div className="ServiceStatusSearchbar">
      <Searchbar />
      </div> */}

        {/* <div className="ServiceStatusSearchbar">
      <Searchbar />
      </div> */}

        <div className="ServiceStatusSelectCar">
          {/* <select className="ServiceStatusSelectCar_Selector" placeholder="Select a car" id="cars">
            
            <option value="volvo">Volvo</option>
            <option value="toyota">Toyota</option>
            <option value="mercedes">Mercedes</option>
            <option value="audi">Audi</option>
          </select> */}
          <VehicleSeletcBarServiceSeeker/>
        </div>


        <div className="ServiceStatusSortBar">
        <button
          className={value === "WaitingtobeServiced" ? "ServiceStatusSortBar_SortButton active" : "ServiceStatusSortBar_SortButton"}
          onClick={() => setValue("WaitingtobeServiced")}
        >
          Waiting To Be Serviced
        </button>
        <button
          className={value === "OnGoingServices" ? "ServiceStatusSortBar_SortButton active" : "ServiceStatusSortBar_SortButton"}
          onClick={() => setValue("OnGoingServices")}
        >
          On Going Services
        </button>
        <button
          className={value === "CompletedServices" ? "ServiceStatusSortBar_SortButton active" : "ServiceStatusSortBar_SortButton"}
          onClick={() => setValue("CompletedServices")}
        >
          Completed Services
        </button>
        </div>
      <div className="container-arr">
      {renderComponent()}
      
      </div>
     
      </main>
    </div>
  );
}

export default ServiceStatus;
