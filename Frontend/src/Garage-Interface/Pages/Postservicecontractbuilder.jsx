import React from "react";
//have to add the back button and the icons as well for notis and alerts
function Postservicecontractbuilder() {
  //object array to hold the details, this shud be dynamic and data shud be fetched from the backend database.
  const contractdetails = [
    {
      username: "Albella Rahi",
      location: "Al Barsha 2, 25.0930, 55.32423",
      RequestedDate: "26/07/24",
      CompletedDate: "28/07/24",
      ServiceID: "7612",
      ImgUrl: "/profilepics-test/DBPF1.png",
    },
  ];
  const cardetails = [
    {
      Make: "Honda",
      Model: "Accord",
      Year: "2021",
      "Number Plate": "DXB C 29182",
    },
  ];

  const ServicesDelivered = () => {};

  return (
    <div className="Userdetailscontainer">
      <h1>Post Service Contract Builder</h1>
      {contractdetails.map((details) => (
        <div key={details["ServiceID"]}>
          <img src={details["ImgUrl"]} alt="Service" />
          <span className="">{details["username"]}</span>
          <div>location: {details["location"]}</div>
          <div>Requested On: {details["RequestedDate"]}</div>
          <div>Completed Date: {details["CompletedDate"]}</div>
          <div>ServiceID: {details["ServiceID"]}</div>
        </div>
      ))}
      <div className="CarDetailsContainer">
        <h2>Car Details</h2>
        {cardetails.map((cardetail) => (
          <div key={cardetails["Number Plate"]}>
            <div> Make: {cardetail["Make"]}</div>
            <div> Model: {cardetail["Model"]}</div>
            <div> Year: {cardetail["Year"]}</div>
            <div> Number: {cardetail["Number Plate"]}</div>
          </div>
        ))}
      </div>
      <div className="ServicesDeliveredContainer">
        <h2 className="">Services Delivered</h2>
        {/* use span if u want here because the button shud be aligned with the h2
        tag above(Services delivered) */}
        <button>Add Delivery Notes</button>
        <label>
          <input type="checkbox" />
          Tyre Change
        </label>
        <span>
          <label>
            Enter Final Price
            <input type="text" />
          </label>
        </span>
        <span>
          <label>
            Delivery Date
            <input type="date" />
          </label>
        </span>
        <div>
          <label>
            <input type="checkbox" />
            Tyre Change
          </label>
          <span>
            <label>
              Enter Final Price
              <input type="text" />
            </label>
          </span>
          <span>
            <label>
              Delivery Date
              <input type="date" />
            </label>
          </span>
          <div>
            <button className="addbtnpre">
              <img src="/icon/Pluscircle.png" alt="Plus Icon" />
              Add Additional Service
            </button>
          </div>
        </div>
      </div>
      <div>
        <button>Download Post-Serivce Contract</button>
        <button>Generate Post-Serivce Contract</button>
      </div>
    </div>
  );
}

export default Postservicecontractbuilder;
