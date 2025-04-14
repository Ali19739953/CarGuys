import React, { useState, useEffect } from "react";
import GarageNavbar from "../Components/GarageNavbar";
import Calendar from "../Components/Calender";
import { useNavigate } from "react-router-dom";
import Mobileheader from "../Components/Mobileheader";
import Headericons from "../Components/Headericons";
import "./CustomerManagement.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchGarageBookings } from "../../Redux/Features/SharedSlices/Bookings/bookingSlice";
import { auth } from "../../firebaseConfig";
import Loader from "../Components/Loader";

const getPaymentMethodIcon = (paymentMethod) => {
  const methodLower = paymentMethod?.toLowerCase() || '';
  
  switch (methodLower) {
    case 'tabby':
      return '/icon/tabby.png';
    case 'cod':
    case 'cash on delivery':
      return '/icon/cod.png';
    case 'card':
    case 'credit card':
    case 'debit card':
      return '/icon/visa.png';
    default:
      return '/icon/visa.png';
  }
};

const CustomerManagement = (props) => {
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

  // hardcoded the values as of now, should be passed null actually
  // const [value1, setValue1] = useState("05/05/2024");
  // const [value2, setValue2] = useState(new Date());
  // const [tooltipInfo, setTooltipInfo] = useState({
  //   visible: false,
  //   text: "",
  //   customerId: null,
  // });
  const [customers, setCustomers] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  // Added pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 5;
  // Change to store selected vehicle by customer ID
  const [selectedVehicles, setSelectedVehicles] = useState({});
  const [vehicleServices, setVehicleServices] = useState({});
  const dispatch = useDispatch();
  const bookings = useSelector((state) => state.booking.bookingRequests);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  
  // Add loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Modify the useEffect that fetches bookings
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoading(true); // Start loading
        dispatch(fetchGarageBookings(user.uid))
          .finally(() => {
            setIsLoading(false); // Stop loading regardless of success/failure
          });
      } else {
        setIsLoading(false); // No user, stop loading
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  // Process bookings and organize by vehicle
  useEffect(() => {
    const processCustomers = () => {
      const customerMap = new Map();
      
      bookings.forEach(booking => {
        const bookingDate = new Date(booking.selectedDate);
        
        // Determine status based on boolean flags
        let status = 'pending';
        if (booking.isCompleted) status = 'completed';
        if (booking.isOngoing) status = 'ongoing';
        if (booking.isPending) status = 'pending';
        
        if (bookingDate >= startDate && bookingDate <= endDate) {
          const customerId = booking.userId;
          
          if (!customerMap.has(customerId)) {
            customerMap.set(customerId, {
              id: customerId,
              name: `${booking.first_name} ${booking.last_name}`,
              vehicles: new Map(),
              latestBooking: booking.selectedDate
            });
          }
          
          const customer = customerMap.get(customerId);
          
          if (booking.selectedVehicle) {
            const vehicleKey = booking.selectedVehicle.numberPlate;
            if (!customer.vehicles.has(vehicleKey)) {
              customer.vehicles.set(vehicleKey, {
                ...booking.selectedVehicle,
                serviceHistory: []
              });
            }
            
            // Add service history with determined status
            customer.vehicles.get(vehicleKey).serviceHistory.push({
              date: booking.selectedDate,
              services: booking.selectedServices,
              time: booking.selectedTime,
              status: status,
              bookingId: booking.id,
              paymentMethod: booking.selectedPayment,
              price: booking.price,
              deliveryDate: booking.deliveryDate
            });
          }
        }
      });
      const processedCustomers = Array.from(customerMap.values()).map(customer => ({
        ...customer,
        vehicles: Array.from(customer.vehicles.values())
      }));

      setCustomers(processedCustomers);
      setTotalCustomers(processedCustomers.length);
    };

    processCustomers();
  }, [bookings, startDate, endDate]);

  // Update calendar handlers
  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  // functions to handle the events
  // const handleAccessContract = (customerId) => {
  //   navigate(`/ServiceContracts/${customerId}`);
  // };

  // const handleReports = (customerId) => {
  //   navigate(`/Reports/${customerId}`);
  // };

  // const handleTooltipMouseEnter = (customer) => {
  //   setTooltipInfo({
  //     visible: true,
  //     text: `Chat with ${customer.name}`,
  //     customerId: customer.id,
  //   });
  // };

  // const handleTooltipMouseLeave = () => {
  //   setTooltipInfo({ visible: false, text: "", customerId: null });
  // };

  // const handleDeleteCustomer = (customerId) => {
  //   const customerToDelete = customers.find((customer) => customer.id === customerId);
  //   const customerName = customerToDelete ? customerToDelete.name : "Unknown Customer";

  //   alert(`Deleted Customer: ${customerName}`);
  //   console.log(`Delete customer with ID: ${customerName}`);

  //   setCustomers((prevCustomers) =>
  //     prevCustomers.filter((customer) => customer.id !== customerId)
  //   );

  //   setTotalCustomers((prevTotal) => prevTotal - 1);
  // };

  // const handleCustomerChat = (customerId) => {
  //   navigate(`/ClientMessenger/${customerId}`);
  // };


  const handleVehicleSelect = (customerId, vehicle, services) => {
    setSelectedVehicles(prev => ({
      ...prev,
      [customerId]: prev[customerId]?.numberPlate === vehicle.numberPlate ? null : vehicle
    }));
    
    setVehicleServices(prev => ({
      ...prev,
      [customerId]: services
    }));
  };

  

  // Calculate pagination values
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = customers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(customers.length / customersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Store selected status per customer
  const [selectedStatuses, setSelectedStatuses] = useState({});

  const handleStatusChange = (customerId, event) => {
    setSelectedStatuses(prev => ({
      ...prev,
      [customerId]: event.target.value
    }));
  };

  useEffect(() => {
    console.log('Vehicle Services:', vehicleServices);
    console.log('Selected Vehicles:', selectedVehicles);
  }, [vehicleServices, selectedVehicles]);

  return (
    <div className="CustomerManagementContainer">
      {isMobile ? <Mobileheader /> : <GarageNavbar />}

      <main className="CustomerManagementMain">
        <header className="CustomerManagementHeader">
          <Headericons Title={"Client Management"} />
        </header>

        {isLoading ? (
          <Loader />
        ) : (
          <div className="CustomerManagementContent">
            <div className="CustomerManagementStatsSection">
              <div className="CustomerManagementStatsSection_IconAndHeading">
                <img
                  src="/icon/IncomingRequestsIcon.png"
                  alt="Incoming Requests"
                  className="CustomerManagementStatsSection_IconAndHeading_Icon"
                />
                <strong className="CustomerManagementStatsSection_IconAndHeading_Heading">
                  Total Customers
                </strong>
              </div>

              <div className="CustomerManagementStatSection_Content">
                <div className="CustomerManagementStatSection_Content_Number">
                  <strong>{totalCustomers}</strong>
                </div>

                <div className="CustomerManagementStatSection_Content_Calender">
                  <div className="CustomerManagementStatsSection_Content_Calender_Statement1">
                    <strong>Customers Interacted From</strong>
                  </div>

                  <div className="CustomerManagementStatsSection_Content_Calender_CalenderSection">
                    <Calendar
                      value1={startDate}
                      setValue1={handleStartDateChange}
                      value2={endDate}
                      setValue2={handleEndDateChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="CustomerManagementDetailsSection">
              <div className="CustomerManagementDetailsSection_Header">
                <h3 className="CustomerManagementDetailsSection_Header_Item">Customer Details</h3>
              </div>

              <div className="CustomerManagementDetailsSection_Content">
                {currentCustomers.map((customer) => (
                  <div key={customer.id} className="CustomerManagementDetailsSection_Item">
                    <div className="CustomerManagementDetailsSection_Item_PictureAndDetails">
                      {/* <div className="CustomerManagementDetailsSection_Item_Picture">
                        <img
                          src={`https://via.placeholder.com/50`}
                          alt={customer.name}
                          className="CustomerManagementDetailsSection_Item_Picture_Img"
                        />
                      </div> */}

                      <div className="CustomerManagementDetailsSection_Item_Details">
                        <h4 className="CustomerManagementDetailsSection_Item_Details_CustomerName">
                          {customer.name}
                        </h4>
                        
                        {/* Vehicles Section */}
                        <div className="CustomerVehicles">
                          {customer.vehicles.map((vehicle) => (
                            <div 
                              key={vehicle.numberPlate} 
                              className={`VehicleCard ${selectedVehicles[customer.id]?.numberPlate === vehicle.numberPlate ? 'VehicleCard--selected' : ''}`}
                              onClick={() => handleVehicleSelect(customer.id, vehicle, vehicle.serviceHistory)}
                            >
                              <div className="VehicleCard_Image">
                                <img 
                                  src={vehicle.imageUrl } 
                                  alt={`${vehicle.make} ${vehicle.model}`}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    // e.target.src = '/vehicles/default-car.png';
                                  }}
                                  className="VehicleCard_Image_Img"
                                />
                              </div>
                              <div className="VehicleCard_Content">
                                <div className="VehicleCard_Header">
                                  <span className="NumberPlate">{vehicle.numberPlate}</span>
                                </div>
                                <div className="VehicleCard_Details">
                                  {vehicle.make} {vehicle.model} ({vehicle.year})
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Service History for Selected Vehicle */}
                        {selectedVehicles[customer.id] && (
                          <div className="VehicleServiceHistory">
                            <div className="VehicleServiceHistory_Header">
                              <div className="VehicleServiceHistory_Header_Left">
                                <img 
                                  src={selectedVehicles[customer.id].imageUrl || '/vehicles/default-car.png'}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/vehicles/default-car.png';
                                  }}
                                  alt={`${selectedVehicles[customer.id].make} ${selectedVehicles[customer.id].model}`}
                                  className="VehicleServiceHistory_Image"
                                />
                                <div className="VehicleServiceHistory_Info">
                                  <h5>{selectedVehicles[customer.id].numberPlate}</h5>
                                  <p>{selectedVehicles[customer.id].make} {selectedVehicles[customer.id].model} ({selectedVehicles[customer.id].year})</p>
                                  <p className="VehicleSpecs">
                                    
                                    {/* <span>Mileage: {selectedVehicles[customer.id].mileage || 'N/A'}</span> */}
                                  </p>
                                </div>
                              </div>
                              <div className="VehicleServiceHistory_Stats">
                                <div className="StatBox">
                                  <span className="StatNumber">{vehicleServices[customer.id]?.length || 0}</span>
                                  <span className="StatLabel">Total Services</span>
                                </div>
                                <div className="StatBox">
                                  <span className="StatNumber">
                                    {vehicleServices[customer.id]?.filter(s => s.status === 'completed').length || 0}
                                  </span>
                                  <span className="StatLabel">Completed</span>
                                </div>
                                <div className="StatBox">
                                  <span className="StatNumber">
                                    {vehicleServices[customer.id]?.filter(s => s.status === 'pending').length || 0}
                                  </span>
                                  <span className="StatLabel">Pending</span>
                                </div>
                              </div>
                            </div>

                            <div className="ServiceRecordsList">
                              <div className="ServiceRecordsList_Header">
                                <h4>Service History</h4>
                                <div className="ServiceRecordsList_Filters">
                                  <select 
                                    className="StatusFilter"
                                    value={selectedStatuses[customer.id] || 'all'}
                                    onChange={(e) => handleStatusChange(customer.id, e)}
                                  >
                                    <option value="all">All Status</option>
                                    <option value="completed">Completed</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="pending">Pending</option>
                                  </select>
                                </div>
                              </div>
                              
                              {vehicleServices[customer.id]
                                ?.filter(service => 
                                  !selectedStatuses[customer.id] || 
                                  selectedStatuses[customer.id] === 'all' || 
                                  service.status === selectedStatuses[customer.id]
                                )
                                ?.map((service, index) => (
                                  <div key={index} className={`ServiceRecord ServiceRecord--${service.status}`}>
                                    <div className="ServiceRecord_Header">
                                      <div className="ServiceRecord_Header_Left">
                                        <span className="ServiceDate">
                                          {new Date(service.date).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                          })}
                                        </span>
                                        <span className="ServiceTime">Time: {service.time}</span>
                                      </div>
                                      <div className="ServiceRecord_Header_Right">
                                        <span className={`StatusBadge StatusBadge--${service.status}`}>
                                          {service.status}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="ServiceRecord_Details">
                                      <div className="ServicesList">
                                        {service.services.map((svc, i) => (
                                          <span key={i} className="ServiceTag">
                                            <i className="fa-solid fa-wrench"></i>
                                            <span>Service {i + 1}: {svc}</span>
                                          </span>
                                        ))}
                                      </div>
                                      
                                      <div className="ServiceRecord_Footer">
                                        <div className="PaymentMethod">
                                          <img 
                                            src={getPaymentMethodIcon(service.paymentMethod)}
                                            alt={service.paymentMethod}
                                            className="PaymentMethod_Icon"
                                          />
                                          <span> Payment Method: {service.paymentMethod}</span>
                                          {service.status !== 'pending' && (
                                            <>
                                              <span> Price: {service.price}</span>
                                              <span> Delivery Date: {service.deliveryDate}</span>
                                            </>
                                          )}
                                        </div>
                                        <div className="ServiceID">
                                          <i className="fas fa-hashtag"></i>
                                          <span>Service ID: {service.bookingId}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="CustomerManagementDetailsSection_Item_Buttons">
                      <div className="CustomerManagementDetailsSection_Item_Buttons_ServiceDetails">
                        {/* <div className="CustomerManagementDetailsSection_Item_Buttons_ServiceDetails_Content">
                          <p>
                            <b>Recent Services: </b>
                            {customer.ServiceType}
                          </p>
                        </div> */}
                      </div>

                      <div className="CustomerManagementDetailsSection_Item_Buttons_Flex">
                        {/* <button
                          className="CustomerManagementDetailsSection_Item_Buttons_AccessContracts"
                          onClick={() => handleAccessContract(customer.id)}
                        >
                          Access contracts
                        </button>

                        <button
                          className="CustomerManagementDetailsSection_Item_Buttons_ClientReports"
                          onClick={() => handleReports(customer.id)}
                        >
                          Client report
                        </button> */}

                        {/* <button
                          className="CustomerManagementDetailsSection_Item_Buttons_Delete"
                          onClick={() => handleDeleteCustomer(customer.id)}
                        >
                          Delete customer
                        </button> */}

                        {/* <div className="CustomerManagementDetailsSection_Item_Buttons">
                          <button
                            className="CustomerManagementDetailsSection_Item_Buttons_Message"
                            onMouseEnter={() => handleTooltipMouseEnter(customer)}
                            onMouseLeave={handleTooltipMouseLeave}
                            onClick={() => handleCustomerChat(customer.id)}
                          >
                            <img
                              src="/icon/Message_circle.png"
                              alt="Message Icon"
                              className="CustomerManagementDetailsSection_Item_Buttons_Message_Icon"
                            />
                          </button>
                          {tooltipInfo.visible && tooltipInfo.customerId === customer.id && (
                            <div className="tooltip">{tooltipInfo.text}</div>
                          )}
                        </div> */}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add pagination controls */}
                <div className="pagination">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-button"
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-button"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerManagement;
