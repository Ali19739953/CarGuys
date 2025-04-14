import React, { useState, useEffect } from 'react';
import { fetchAllGarages } from '../../api/garageUsers';
import { Link } from 'react-router-dom';
import { Modal, Box } from '@mui/material';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../Redux/Features/SharedSlices/Users/userSlice';
import Loader from '../../Garage-Interface/Components/Loader';
// import './Ratings.css';

const formatTimestamp = (timestamp) => {
  console.log('Raw timestamp:', timestamp); // Debug log

  if (!timestamp) return 'No date';

  try {
    if (timestamp && timestamp.seconds) {
      return moment(timestamp.seconds * 1000).format('MMMM D, YYYY');
    }
    if (typeof timestamp === 'string') {
      return moment(timestamp).format('MMMM D, YYYY');
    }
    
    // Handle timestamp with nanoseconds
    if (timestamp && timestamp.nanoseconds) {
      const milliseconds = timestamp.seconds * 1000;
      return moment(milliseconds).format('MMMM D, YYYY');
    }

    return 'Invalid date format';
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Invalid date';
  }
};

function Ratings() {
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGarage, setSelectedGarage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#53E203'; // Dark green
    if (rating >= 4) return '#4CAF50';   // Green
    if (rating >= 3.5) return '#FFA000';  // Orange
    if (rating >= 3) return '#FF6D00';    // Dark orange
    if (rating >= 2) return '#F44336';    // Red
    return '#D32F2F';                     // Dark red
  };

  const handleOpenModal = (garage) => {
    setSelectedGarage(garage);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGarage(null);
  };

  useEffect(() => {
    const loadGarages = async () => {
      try {
        console.log("Starting to fetch garages...");
        const allGarages = await fetchAllGarages();
        console.log("All garages fetched:", allGarages);
        
        const garagesWithRatings = allGarages.map(garage => {
          const reviews = garage.garageDetails?.reviews || [];
          
          const averageRating = reviews.length > 0
            ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length
            : 0;
          
          return {
            ...garage,
            ...garage.garageDetails,
            averageRating,
            totalRatings: reviews.length,
            reviews: reviews
          };
        });

        const sortedGarages = garagesWithRatings
          .filter(garage => garage.totalRatings > 0)
          .sort((a, b) => b.averageRating - a.averageRating);

        console.log("Final sorted garages:", sortedGarages);
        setGarages(sortedGarages);
      } catch (error) {
        console.error("Error loading rated garages:", error);
      } finally {
        setLoading(false);
      }
    };

    loadGarages();
  }, []);

  return (
    <div>
      {!isAuthenticated ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px', 
          color: 'white',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <p>Please log in to view garage ratings.</p>
        </div>
      ) : loading ? (
        <Loader />
      ) : (
        <>
          <div className="BrowseGarageContent">
            <div className="garage-list">
              {garages.length === 0 ? (
                <p>No rated garages found.</p>
              ) : (
                garages.map((garage) => (
                  <div 
                    key={garage.id} 
                    className="garage-item"
                    onClick={() => handleOpenModal(garage)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="garage-info">
                      
                      <div className="garage-image">
                        {garage.profileImageUrl ? (
                          <img 
                            src={garage.profileImageUrl} 
                            alt={`${garage.garage_name} profile`}
                            style={{ 
                              width: '80px', 
                              height: '80px', 
                              objectFit: 'cover', 
                              borderRadius: '10%',
                              background: 'transparent',
                              boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
                              backgroundSize: 'cover',
                            }}
                          />
                        ) : (
                          <div className="placeholder-image">No Image</div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="garagename" style={{color:'white', marginLeft:'10px', marginBottom:'20px'}}>{garage.garage_name}</h3>
                        <div className="rating-info">
                          <div className="stars">
                            {[...Array(5)].map((_, index) => (
                              <span 
                                key={index}
                                className={index < Math.round(garage.averageRating) ? 'star filled' : 'star'}
                                style={{ 
                                  color: index < Math.round(garage.averageRating) 
                                    ? getRatingColor(garage.averageRating) 
                                    : '#ccc'
                                }}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="rating-text" style={{ color: getRatingColor(garage.averageRating) }}>
                            ({garage.averageRating.toFixed(1)} • {garage.totalRatings} reviews)
                          </span>
                        </div>
                        {/* {garage.description && (
                          <p className="garage-description">{garage.description}</p>
                        )} */}
                      </div>
                    </div>
                    <div className="recent-reviews">
                      {/* {garage.reviews?.slice(0, 2).map((review, index) => (
                        <div key={index} className="review-item">
                          <p className="review-text">{review.comment}</p>
                          <span className="review-rating">Rating: {review.rating}/5</span>
                        </div>
                      ))} */}
                    </div>
                    <div className="garage-actions">
                      <Link to={`/ViewGarageDetails/${garage.id}`}>
                        <button className="details-btn">View Garage details</button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Added Modal */}
          <Modal
            open={isModalOpen}
            onClose={handleCloseModal}
            aria-labelledby="review-modal"
            aria-describedby="review-details"
          >
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              maxWidth: 600,
              bgcolor: '#111',
              color: 'white',
              border: '1px solid rgba(255, 165, 0, 0.3)',
              boxShadow: '0 0 20px rgba(255, 165, 0, 0.1)',
              p: 4,
              borderRadius: 2,
              maxHeight: '90vh',
              overflow: 'auto',
              background: 'linear-gradient(90deg, rgba(17, 17, 17, 0.95) 0%, rgba(17, 17, 17, 0.98) 100%)',
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
                height: '1px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#1D1B20',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#FFA500',
                borderRadius: '10px',
                '&:hover': {
                  backgroundColor: '#FF8C00',
                },
              },
              scrollbarWidth: 'thin',
              scrollbarColor: '#FFA500 #1D1B20',
            }}>
              {selectedGarage && (
                <>
                  <h2 style={{ 
                    textAlign: 'center',
                    color: '#FFA500',
                    marginBottom: '20px',
                    fontWeight: 'bold'
                  }}>
                    {selectedGarage.garage_name} - Reviews
                  </h2>
                  
                  <div className="rating-summary" style={{
                    textAlign: 'center',
                    marginBottom: '25px',
                    padding: '10px',
                    background: 'rgba(255, 165, 0, 0.1)',
                    borderRadius: '8px'
                  }}>
                    <div className="stars" style={{ marginBottom: '10px' }}>
                      {[...Array(5)].map((_, index) => (
                        <span 
                          key={index}
                          style={{ 
                            color: index < Math.round(selectedGarage.averageRating) 
                              ? getRatingColor(selectedGarage.averageRating) 
                              : '#333',
                            fontSize: '24px',
                            margin: '0 2px'
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span style={{ 
                      color: getRatingColor(selectedGarage.averageRating),
                      fontWeight: 'bold'
                    }}>
                      {selectedGarage.averageRating.toFixed(1)} • {selectedGarage.totalRatings} reviews
                    </span>
                  </div>
                  
                  <div style={{
                    maxHeight: '50vh',
                    overflow: 'auto',
                    padding: '10px',
                    '&::-webkit-scrollbar': {
                      width: '6px',
                      height: '1px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: '#1D1B20',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: '#FFA500',
                      borderRadius: '10px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                      backgroundColor: '#FF8C00',
                    },
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#FFA500 #1D1B20',
                  }}>
                    {selectedGarage.reviews.map((review, index) => (
                      <div key={index} style={{
                        padding: '15px',
                        marginBottom: '15px',
                        background: 'rgba(255, 165, 0, 0.05)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 165, 0, 0.1)'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '10px',
                          alignItems: 'center'
                        }}>
                          <strong style={{ color: '#FFA500' }}>{review.userName}</strong>
                          <span style={{ color: '#666' }}>
                            {formatTimestamp(review.timestamp)}
                          </span>
                        </div>
                        
                        <div style={{ marginBottom: '10px' }}>
                          {[...Array(5)].map((_, i) => (
                            <span key={i} style={{
                              color: i < review.rating ? getRatingColor(review.rating) : '#333',
                              marginRight: '2px'
                            }}>★</span>
                          ))}
                        </div>
                        
                        <p style={{ 
                          margin: 0,
                          color: '#CCC',
                          lineHeight: '1.5'
                        }}>{review.comment}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%'
                  }}>
                    <button 
                      onClick={handleCloseModal}
                      style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        background: 'linear-gradient(90deg, #FFA500 0%, #FF8C00 100%)',
                        color: 'Black',
                        fontSize: '14px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        width: '50%',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </Box>
          </Modal>
        </>
      )}
    </div>
  );
}

export default Ratings;
