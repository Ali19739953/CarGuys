import React, { useState, useEffect } from "react";
import HeaderSeeker from "../Components/NavBarSeeker";
import "./BrowseGarage.css";
import BrowseGarageComponent from "../Components/BrowseGarageComponent";
import HeadericonsSeeker from "../Components/HeaderIconSeeker";
// import Searchbar from "../../Garage-Interface/Components/Searchbar";
import NavBarMobile from "../Components/NavBarMobile";
function BrowseGarage() {
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
 
 
  return (
    <div className="BrowseGarageContainer">
       {isMobile ? <NavBarMobile /> : <HeaderSeeker />}

      <div className="BrowseGarageMain">

        <header className="BrowseGarageHeader">
        {/* HEADER ICONS WILL COME HERE */}
        <HeadericonsSeeker Title={"Garage Browser"}/>
        {/* <h2 className="title">Garage Browser</h2> */}
        
        </header>

        
        {/* <div className="search-bar">
          <input type="text" placeholder="Search" />
        </div> */}
        <div className="BrowseGarageSearchbar">
   {/* <Searchbar /> */}
      </div>
  <br/>
      <div className="BrowseGarageSortBar">
        <BrowseGarageComponent />
        </div>
    

       
    </div>
    </div>
  );
}

export default BrowseGarage;
