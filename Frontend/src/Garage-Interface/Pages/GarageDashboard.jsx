import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import GarageNavbar from "../Components/GarageNavbar";
import Mobileheader from "../Components/Mobileheader";
import Headericons from "../Components/Headericons";
import "./GarageDashboard.css";
import { selectUserType, selectUserInfo } from "../../Redux/Features/SharedSlices/Users/userSlice";
import { fetchGarageBookings } from "../../Redux/Features/SharedSlices/Bookings/bookingSlice";
import { auth, firestore } from "../../firebaseConfig";
import Loader from "../Components/Loader";
//hardcoded inspirational quotes
const inspirationalQuotes = [
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Quality means doing it right when no one is looking. - Henry Ford",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
  "The best way to predict the future is to create it. - Peter Drucker",
  "Excellence is not a skill, it's an attitude. - Ralph Marston",
  "The only limit to our realization of tomorrow will be our doubts of today. - Franklin D. Roosevelt",
  "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work. - Steve Jobs",
  "The difference between ordinary and extraordinary is that little extra. - Jimmy Johnson",
  "Success usually comes to those who are too busy to be looking for it. - Henry David Thoreau",
  "Don't watch the clock; do what it does. Keep going. - Sam Levenson"
];

const GarageDashboard = () => {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLoading, setIsLoading] = useState(true);
  
  // Redux selectors
  const bookings = useSelector((state) => state.booking.bookingRequests);
  const userInfo = useSelector(selectUserInfo);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter bookings by status
  const pendingBookings = bookings.filter(booking => booking.isPending);
  const ongoingBookings = bookings.filter(booking => booking.isOngoing);
  const completedBookings = bookings.filter(booking => booking.isCompleted);

  // Get latest pending booking
  const latestPendingBooking = pendingBookings.length > 0 
    ? pendingBookings.reduce((latest, current) => {
        return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest;
      })
    : null;


  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoading(true);
        // Set up real-time listener for bookings
        const bookingsUnsubscribe = firestore
          .collection('Bookings')
          .where('garageId', '==', user.uid)
          .onSnapshot((snapshot) => {
            const changes = snapshot.docChanges();
            if (changes.length > 0) {
              // Refresh bookings when changes occur
              dispatch(fetchGarageBookings(user.uid))
                .finally(() => {
                  setIsLoading(false);
                });
            } else {
              setIsLoading(false);
            }
          });

        // Initial fetch
        dispatch(fetchGarageBookings(user.uid))
          .finally(() => {
            setIsLoading(false);
          });

        return () => bookingsUnsubscribe();
      } else {
        setIsLoading(false);
      }
    });

    window.addEventListener("resize", handleResize);
    return () => {
      unsubscribe();
      window.removeEventListener("resize", handleResize);
    };
  }, [dispatch]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!userInfo?.user_id) return;

      try {
        //Garage document reference
        const garageRef = firestore.collection("GarageDetails")
                                 .doc(userInfo.user_id);
        
        const garageDoc = await garageRef.get();
        
        if (garageDoc.exists) {
          // Reviews array directly from the document in firestore
          const garageData = garageDoc.data();
          const reviewsArray = garageData.reviews || [];
          
          // Sorting reviews by timestamp and taking the latest 3 reviews
          const sortedReviews = reviewsArray
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 3);
          
          setReviews(sortedReviews);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, [userInfo]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // WeatherAPI.com 
        const API_KEY = '2444fba0a55e4a2d9ef175311242611';
        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=Dubai&aqi=no`
        );
        if (!response.ok) {
          throw new Error('Weather fetch failed');
        }
        const data = await response.json();
        console.log('Weather data:', data);
        setWeather(data);
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  // Calculate weekly sales
  const calculateWeeklySales = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // Filter bookings with paymentDone=true for current week
    const currentWeekSales = bookings
      .filter(booking => 
        booking.paymentDone === true && 
        booking.deliveryDate && 
        new Date(booking.deliveryDate) >= oneWeekAgo
      )
      .reduce((total, booking) => total + (parseFloat(booking.price) || 0), 0);

    // Calculate previous week sales
    const twoWeeksAgo = new Date(oneWeekAgo);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);
    
    const previousWeekSales = bookings
      .filter(booking => 
        booking.paymentDone === true && 
        booking.deliveryDate && 
        new Date(booking.deliveryDate) >= twoWeeksAgo && 
        new Date(booking.deliveryDate) < oneWeekAgo
      )
      .reduce((total, booking) => total + (parseFloat(booking.price) || 0), 0);

    const percentageChange = previousWeekSales === 0 
      ? 0 
      : ((currentWeekSales - previousWeekSales) / previousWeekSales) * 100;

    return {
      amount: currentWeekSales,
      change: percentageChange.toFixed(1)
    };
  };

  
  const weeklySales = calculateWeeklySales();

  // Added null checks for weather data rendering
  const renderWeatherContent = () => {
    if (loading) {
      return <p>Loading weather...</p>;
    }

    if (!weather || !weather.current) {
      return <p>Unable to load weather data</p>;
    }

    return (
      <>
        <div className="weather-main">
          <img 
            src={weather.current.condition.icon}
            alt={weather.current.condition.text}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/icon/WeatherIcon.png';
            }}
          />
          <div className="weather-info">
            <h2>{Math.round(weather.current.temp_c)}°C</h2>
            <p>{weather.current.condition.text}</p>
          </div>
        </div>
        <div className="weather-details">
          <div className="weather-detail">
            <span>Humidity</span>
            <span>{weather.current.humidity}%</span>
          </div>
          <div className="weather-detail">
            <span>Wind</span>
            <span>{Math.round(weather.current.wind_kph)} km/h</span>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="GarageDashboardContainer">
      {isMobile ? <Mobileheader /> : <GarageNavbar />}

      <main className="GarageDashboardMain">
        <header className="GarageDashboardHeader">
          <Headericons
            WelcomeText="Welcome, "
            GarageName={userInfo?.garage_name || "Loading..."}
          />
        </header>

        {isLoading ? (
          <Loader />
        ) : (
          <section className="GarageDashboardContent">
            <section className="GarageDashboardStatsSection">
              <div className="GarageStatsCard">
                <div className="GarageStatsCard_Icon">
                  <img
                    src="/icon/WeeklySalesIcon.png"
                    alt="Weekly Sales"
                    className="WeeklySalesIcon"
                  />
                  <h4>Weekly Sales</h4>
                </div>
                <p>AED {weeklySales.amount.toFixed(2)}</p>
                <small>⬆ {weeklySales.change}% from last week</small>
              </div>

              <div className="GarageStatsCard">
                <div className="GarageStatsCard_Icon">
                  <img
                    src="/icon/TotalBookingsIcon.png"
                    alt="Total Bookings" 
                    className="TotalBookingsIcon"
                  />
                  <h4>Total Bookings</h4>
                </div>
                <p>{bookings.length}</p>
                <small>Total number of bookings</small>
              </div>

              <div className="GarageStatsCard">
                <div className="GarageStatsCard_Icon">
                  <img
                    src="/icon/ServicesIcon.png"
                    alt="Pending Services"
                    className="PendingServicesIcon"
                  />
                  <h4>Incoming Services</h4>
                </div>
                <p>{pendingBookings.length}</p>
                <small>Services Incoming</small>
              </div>

              <div className="GarageStatsCard">
                <div className="GarageStatsCard_Icon">
                  <img
                    src="/icon/ServicesIcon.png"
                    alt="Ongoing Services"
                    className="OngoingServicesIcon"
                  />
                  <h4>Ongoing Services</h4>
                </div>
                <p>{ongoingBookings.length}</p>
                <small>Ongoing Services</small>
              </div>

              <div className="GarageStatsCard">
                <div className="GarageStatsCard_Icon">
                  <img
                    src="/icon/ServicesIcon.png"
                    alt="Completed Services"
                    className="CompletedServicesIcon"
                  />
                  <h4>Completed Services</h4>
                </div>
                <p>{completedBookings.length}</p>
                <small>Services completed</small>
              </div>

              <div className="GarageStatsCard">
                <div className="GarageStatsCard_Icon">
                  <img
                    src="/icon/StatsCliet.png"
                    alt="Total Clients"
                    className="TotalClientsIcon"
                  />
                  <h4>Total Clients</h4>
                </div>
               
                <p>{Array.from(new Set(bookings.map(booking => booking.userId))).length}</p>
                <small>Total clients serviced</small>
              </div>
            </section>

            <section className="GarageStatsSection2">
              <div className="GarageStatsSection2_ChartContainer">
                <div className="content-wrapper">
                  {/* Quotes Section */}
                  <div className="quotes-section">
                    <div className="GarageStatsCard_Icon">
                      <svg 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        className="QuoteIcon"
                      >
                        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
                      </svg>
                      <h4>Inspirational Quotes</h4>
                    </div>
                    <div className="quote-ticker-container">
                      <div className="quote-ticker">
                        {inspirationalQuotes.map((quote, index) => (
                          <span key={index} className="quote-item">
                            {quote} &nbsp;&nbsp;&nbsp;&nbsp;
                          </span>
                        ))}
                        {inspirationalQuotes.map((quote, index) => (
                          <span key={`duplicate-${index}`} className="quote-item">
                            {quote} &nbsp;&nbsp;&nbsp;&nbsp;
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Weather Section */}
                  <div className="weather-section">
                    <div className="GarageStatsCard_Icon">
                      <svg 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        className="WeatherIcon"
                      >
                        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                        <circle cx="12" cy="12" r="4" />
                      </svg>
                      <h4>Local Weather</h4>
                    </div>
                    <div className="weather-content">
                      {renderWeatherContent()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="GarageStatsSection2_ReviewsContainer">
                <div className="GarageStatsCard_Icon">
                  <img
                    src="/icon/ClientReviewsIcon.png"
                    alt="Client Reviews"
                    className="ClientReviewsIcon"
                  />
                  <h4>Client Reviews</h4>
                </div>
                {reviews.length === 0 ? (
                  <p>No reviews yet</p>
                ) : (
                  reviews.map((review, index) => (
                    <div key={index} className="GarageStatsSection2_ReviewsContainer_ReviewCard">
                      <p>
                        <strong>{review.userName}</strong> {'⭐'.repeat(review.rating)}
                      </p>
                      <small>{review.comment}</small>
                    </div>
                  ))
                )}
              </div>
            </section>
          </section>
        )}
      </main>
    </div>
  );
};

export default GarageDashboard;
