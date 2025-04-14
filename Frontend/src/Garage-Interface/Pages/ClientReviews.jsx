import React from "react";
import { useState, useEffect } from "react";
import GarageNavbar from "../Components/GarageNavbar";
// import Searchbar from "../Components/Searchbar";
import "./ClientReviews.css";
import Mobileheader from "../Components/Mobileheader";
import Headericons from "../Components/Headericons";
import { useSelector, useDispatch } from "react-redux";
import { 
  fetchAllGarageDetails,
  selectAllGarageDetails,
  selectGarageDetailsStatus
} from "../../Redux/Features/Garage-interface/garageDetails";
import { selectUserInfo } from "../../Redux/Features/SharedSlices/Users/userSlice";
import { FaStar } from 'react-icons/fa';
import Loader from "../Components/Loader";

function ClientReviews() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;
  
  const dispatch = useDispatch();
  const garageDetails = useSelector(selectAllGarageDetails);
  const status = useSelector(selectGarageDetailsStatus);
  const userInfo = useSelector(selectUserInfo);
  const garageId = userInfo?.user_id;
  
  const currentGarage = garageDetails.find(garage => garage.id === garageId);
  const reviews = currentGarage?.reviews || [];

  // Calculate pagination values
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  // Add the handlePageChange function
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Debug logs
  useEffect(() => {
    console.log('Debug - Current State:', {
      userInfo,
      garageId,
      allGarages: garageDetails,
      currentGarage,
      reviews,
      status
    });
  }, [userInfo, garageId, garageDetails, currentGarage, reviews, status]);

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (garageId) {
      setIsLoading(true); // Start loading
      dispatch(fetchAllGarageDetails())
        .finally(() => {
          setIsLoading(false); // Stop loading
        });
    } else {
      setIsLoading(false); // No garage ID, stop loading
    }
  }, [dispatch, garageId]);

  return (
    <div className="ClientReviewsContainer">
      {isMobile ? <Mobileheader /> : <GarageNavbar />}

      <main className="ClientReviewsMain">
        <header className="ClientReviewsHeader">
          <Headericons Title={"Client Reviews"} />
        </header>

        {isLoading ? (
          <Loader />
        ) : (
          <div className="ClientReviewsContent">
            {status === 'loading' ? (
              <p>Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <div className="no-reviews-message">No reviews yet</div>
            ) : (
              <>
                {currentReviews.map((review, index) => (
                  <div key={index} className="ClientReviewsItem">
                    <div className="ReviewHeader">
                      <div className="ReviewInfo">
                        <img 
                          src={review.vehicleInfo?.ImageUrl || "/profilepics-test/DBPF1.png"} 
                          alt={`${review.userName}'s Car`} 
                          className="VehicleImage"
                        />
                        <div className="ReviewDetails">
                          <div className="UserName">{review.userName}</div>
                          <div className="VehicleDetails">
                            <div>Make: <span>{review.vehicleInfo?.make || 'N/A'}</span></div>
                            <div>Model: <span>{review.vehicleInfo?.model || 'N/A'}</span></div>
                            <div>Year: <span>{review.vehicleInfo?.year || 'N/A'}</span></div>
                            <div>Number Plate: <span>{review.vehicleInfo?.numberPlate || 'N/A'}</span></div>
                            <div>Service ID: <span>{review.serviceId || 'N/A'}</span></div>
                          </div>
                          <div className="Timestamp">
                            {review.timestamp?._seconds && 
                              new Date(review.timestamp._seconds * 1000).toLocaleString('en-US', {
                                month: '2-digit',
                                day: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })
                            }
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="ReviewContent">
                      <p>{review.comment}</p>
                      <div className="StarRating">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={i < review.rating ? "star-filled" : "star-empty"}
                          />
                        ))}
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
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default ClientReviews;