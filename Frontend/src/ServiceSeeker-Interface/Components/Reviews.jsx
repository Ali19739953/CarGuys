import React, { useState, useEffect } from 'react';
import { firestore } from '../../firebaseConfig';
import moment from 'moment';

function Reviews({ garageId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#53E203'; // Dark green
    if (rating >= 4) return '#4CAF50';   // Green
    if (rating >= 3.5) return '#FFA000';  // Orange
    if (rating >= 3) return '#FF6D00';    // Dark orange
    if (rating >= 2) return '#F44336';    // Red
    return '#D32F2F';                     // Dark red
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'No date';

    try {
      if (timestamp && timestamp.seconds) {
        return moment(timestamp.seconds * 1000).format('MMMM D, YYYY');
      }
      if (typeof timestamp === 'string') {
        return moment(timestamp).format('MMMM D, YYYY');
      }
      
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

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const garageRef = firestore.collection('GarageDetails').doc(garageId);
        const doc = await garageRef.get();
        
        if (doc.exists) {
          const garageData = doc.data();
          const reviewsData = garageData.reviews || [];
          
          // Calculate average rating
          const avgRating = reviewsData.length > 0
            ? reviewsData.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewsData.length
            : 0;
          
          setAverageRating(avgRating);
          setTotalRatings(reviewsData.length);
          setReviews(reviewsData);
        } else {
          setError('No reviews found');
        }
        setLoading(false);
      } catch (e) {
        setError('Error fetching reviews');
        setLoading(false);
      }
    };

    if (garageId) {
      fetchReviews();
    }
  }, [garageId]);

  // Calculate pagination values
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) return <div>Loading reviews...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div className="rating-summary" style={{
        textAlign: 'center',
        marginBottom: '25px',
        padding: '10px',
        marginTop: '20px',
        background: 'rgba(255, 165, 0, 0.1)',
        borderRadius: '8px'
      }}>
        <div className="stars" style={{ 
          marginBottom: '10px',
          padding: '5px 0'
        }}>
          {[...Array(5)].map((_, index) => (
            <span 
              key={index}
              style={{ 
                color: index < Math.round(averageRating) 
                  ? getRatingColor(averageRating) 
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
          color: getRatingColor(averageRating),
          fontWeight: 'bold'
        }}>
          {averageRating.toFixed(1)} • {totalRatings} reviews
        </span>
      </div>

      <div className="reviews-list">
        {currentReviews.map((review, index) => (
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

      {reviews.length > reviewsPerPage && (
        <div className="pagination" style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginTop: '20px'
        }}>
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '8px 16px',
              border: '1px solid #FFA500',
              borderRadius: '4px',
              background: currentPage === 1 ? '#f5f5f5' : 'white',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>
          
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              style={{
                padding: '8px 16px',
                border: '1px solid #FFA500',
                borderRadius: '4px',
                background: currentPage === index + 1 ? '#FFA500' : 'white',
                color: currentPage === index + 1 ? 'white' : 'black',
                cursor: 'pointer'
              }}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 16px',
              border: '1px solid #FFA500',
              borderRadius: '4px',
              background: currentPage === totalPages ? '#f5f5f5' : 'white',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Reviews;
