import React, { useState, useEffect, useRef } from "react";
import "./Homepage.css";
import {motion} from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import { firestore } from "../firebaseConfig.jsx"; 
import reverseGeocode from "../api/reverseGeocode.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);


function HomePage() {
  const navigate = useNavigate();

  const [activeGarageCardIndex, setActiveGarageCardIndex] = useState(0);

  const scrollGarageCardCarousel = (direction) => {
    if (direction === 'left') {
      setActiveGarageCardIndex((prevIndex) => (prevIndex === 0 ? garages.length - 1 : prevIndex - 1));
    } else {
      setActiveGarageCardIndex((prevIndex) => (prevIndex === garages.length - 1 ? 0 : prevIndex + 1));
    }
  };

 

  const pop = () => {
    alert("Backend services are not available including login and signup. I am a student and don't want to spend money on hosting the backend, Although the complete project is available on GitHub!");
  };

  useEffect(() => {
    pop();
  }, []); 

  const [activeIndex, setActiveIndex] = useState(0);
  const testimonials = [
    {
      name: "Alia Bashir",
      description: "CarGuys helped me find a reliable garage nearby. The service was excellent, and the process was smooth. Highly recommend!",
      image: "./homepageImages/Testimonial2.jpeg",
    },
    {
      name: "Sultana Saood",
      description: "Great platform! I booked a service with ease, and the garage delivered exceptional quality. Will definitely use again!",
      image: "./homepageImages/Testimonial4.jpeg",
    },
    {
      name: "Hamdan Al Abood",
      description: "Had an amazing experience with CarGuys. The process was seamless, and the garage service exceeded my expectations!",
      image: "./homepageImages/Testimonial1.jpeg",
    },
    {
      name: "Shamsi Al Abood",
      description: "CarGuys helped me find a reliable garage nearby. The service was excellent, and the process was smooth. Highly recommend!",
      image: "./homepageImages/Testimonial3.jpeg",
    },
    {
      name: "Jasim Akbar",
      description: "Great platform! I booked a service with ease, and the garage delivered exceptional quality. Will definitely use again!",
      image: "./homepageImages/Testimonial5.jpeg",
    },
    {
      name: "Noor",
      description: "CarGuys has been a game-changer for my garage! The platform helps me connect with more customers and manage bookings efficiently. The in-house messenger makes communication seamless, and the tools provided have boosted my business significantly",
      image: "./homepageImages/Testimonial6.jpeg",
    },

    {
      name: "Borhan Abu Taher",
      description: "كارجايز قد غيّر تمامًا الطريقة التي أتعامل بها مع خدمات السيارات! المنصة سهلة الاستخدام بشكل لا يصدق، وأحب كيف يمكنني إدارة مركبات متعددة وحجز الخدمات كلها في مكان واحد",
      image: "./homepageImages/Testimonial7.jpeg",
    },
  ];
  
  

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % testimonials.length;
        return newIndex;
      });
    }, 5000);
  
    return () => clearInterval(interval); 
  }, [testimonials.length]);
  
  
  const scrollUserCarousel = (direction) => {
    const carousel = document.getElementById('user-carousel');
    const scrollAmount = 300; // Adjust this value based on how much you want to scroll
  
    if (direction === 'left') {
      carousel.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth',
      });
    } else {
      carousel.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };
  

  const texts = [
    "Welcome to CarGuys",
    "Your All-in-One Vehicle Service Platform",
    "Experience Smooth, Transparent and Hassle-free Vehicle Servicing",
    "Choose from a Variety of Trusted Garages",
    "Join Our Network of Trusted Garages",
    "Garage Owners, Grow Your Business with Us",
    "Streamline Your Garage Operations",
    "Manage Bookings and Services Efficiently"
  ];

  
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  

 
  useEffect(() => {
    const interval = setInterval(() => {
     
      gsap.to(".TestTextcirclesection_Text1", {
        y: -50, 
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => {
          
          setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
  
          
          gsap.fromTo(
            ".TestTextcirclesection_Text1",
            { y: 50, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" } 
          );
        },
      });
    }, 5000); 
  
    return () => clearInterval(interval);
  }, [texts.length]);


  
  
  

 
  const [activeTab, setActiveTab] = useState("gettingService");

   // State to hold garage data
   const [garages, setGarages] = useState([]);


   // Function to fetch garages from Firestore
   useEffect(() => {
    
    const fetchPopularGarages = async () => {
      try {
        const bookingRef = firestore.collection("BookingRequests");
        const bookingsSnapshot = await bookingRef.get();

        const garageBookingCounts = {};
        bookingsSnapshot.forEach((doc) => {
          const booking = doc.data();
          const garageId = booking.garageId;
          if (garageId) {
            garageBookingCounts[garageId] = (garageBookingCounts[garageId] || 0) + 1;
          }
        });

        const sortedGarageIds = Object.entries(garageBookingCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([garageId]) => garageId);

        const garageRef = firestore.collection("Garage Users");
        const garagesSnapshot = await garageRef.get();

        const popularGarages = garagesSnapshot.docs
          .map((doc) => ({ ...doc.data(), id: doc.id }))
          .filter((garage) => sortedGarageIds.includes(garage.id))
          .slice(0, 4);

        const garageDetailsPromises = popularGarages.map(async (garage) => {
          const garageDetailsRef = firestore
            .collection("GarageDetails")
            .doc(garage.id);
          const garageDetailsDoc = await garageDetailsRef.get();

          const description = garageDetailsDoc.exists
            ? garageDetailsDoc.data().description
            : "No description available";

          // const location = garage.garage_location; // Get the location (lat, lng)

          let address = "Location not available";
          if (location && location.lat && location.lng) {
            // Call reverseGeocode function with lat, lng
            // address = await reverseGeocode(location.lat, location.lng);
          }

          const reviews = garageDetailsDoc.exists
            ? garageDetailsDoc.data().reviews || []
            : [];
          const ratings = reviews.map((review) => review.rating);
          const averageRating =
            ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

          return {
            ...garage,
            description,
            averageRating, 
          };
        });

        const garagesWithDescriptionsAndAddresses = await Promise.all(garageDetailsPromises);
        setGarages(garagesWithDescriptionsAndAddresses);
      } catch (error) {
        // console.error("Error fetching popular garages: ", error);
      }
    };

    fetchPopularGarages();
  }, []);


  const handleTabClick = (tab) => {
    setActiveTab(tab);
    
    gsap.to(window, {
      duration: 0.5,
      scrollTo: { y: ".HomePageTabContent", offsetY: 70 },
      ease: "power2.inOut"
    });
  };

  
  useEffect(() => {
    // Create refs for the circles
    const circle1 = document.querySelector('.testcircle1');
    const circle2 = document.querySelector('.testcircle2');
    const circle3 = document.querySelector('.testcircle3');

    
    const baseAnimations = {
      circle1: gsap.to(circle1, {
        y: "-=30",
        x: "+=20",
        rotation: 360,
        scale: 1.2,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        transformOrigin: "center center",
        paused: true
      }),
      circle2: gsap.to(circle2, {
        y: "+=40",
        x: "-=25",
        rotation: -360,
        scale: 1.15,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        transformOrigin: "center center",
        paused: true
      }),
      circle3: gsap.to(circle3, {
        y: "-=35",
        x: "+=15",
        rotation: 360,
        scale: 1.25,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        transformOrigin: "center center",
        paused: true
      })
    };

    // Start base animations
    baseAnimations.circle1.play();
    baseAnimations.circle2.play();
    baseAnimations.circle3.play();

    // Cursor follow effect
    const handleMouseMove = (e) => {
      const circles = [circle1, circle2, circle3];
      
      circles.forEach((circle, index) => {
        if (!circle) return;

        const rect = circle.getBoundingClientRect();
        const circleX = rect.left + rect.width / 2;
        const circleY = rect.top + rect.height / 2;

        
        const distX = e.clientX - circleX;
        const distY = e.clientY - circleY;

        
        const distance = Math.sqrt(distX * distX + distY * distY);
        
        
        if (distance < 300) {
          
          baseAnimations[`circle${index + 1}`].pause();

          
          const strength = 1 - (distance / 300);
          
          // Move towards cursor with easing
          gsap.to(circle, {
            x: `+=${distX * strength * 0.1}`,
            y: `+=${distY * strength * 0.1}`,
            duration: 0.5,
            ease: "power2.out"
          });
        } else {
          
          if (!baseAnimations[`circle${index + 1}`].isActive()) {
            baseAnimations[`circle${index + 1}`].resume();
          }
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      gsap.killTweensOf(['.testcircle1', '.testcircle2', '.testcircle3']);
    };
  }, []); 

  
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const sections = activeTab === "gettingService" 
      ? [
          ".HomePageTabContent_GettingService_1",
          ".HomePageTabContent_GettingService_2",
          ".HomePageTabContent_GettingService_3",
          ".HomePageTabContent_GettingService_4"
        ]
      : [
          ".HomePageTabContent_ProvidingService_1",
          ".HomePageTabContent_ProvidingService_2",
          ".HomePageTabContent_ProvidingService_3",
          ".HomePageTabContent_ProvidingService_4"
        ];

    sections.forEach((section) => {
      gsap.fromTo(section,
        {
          opacity: 0,
          x: -100, 
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.3, 
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            end: "top 15%",
            scrub: false, 
            toggleActions: "play reverse play reverse",
            onEnter: () => {
              gsap.fromTo(section,
                {
                  opacity: 0,
                  x: -100 
                },
                {
                  opacity: 1,
                  x: 0,
                  duration: 0.3
                }
              );
            },
            onLeave: () => {
              gsap.to(section, {
                opacity: 0,
                x: 100, 
                duration: 0.3
              });
            },
            onEnterBack: () => {
              gsap.fromTo(section,
                {
                  opacity: 0,
                  x: 100 
                },
                {
                  opacity: 1,
                  x: 0,
                  duration: 0.3
                }
              );
            },
            onLeaveBack: () => {
              gsap.to(section, {
                opacity: 0,
                x: -100, 
                duration: 0.3
              });
            }
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [activeTab]);

  
  const [slideDirection, setSlideDirection] = useState('right');

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideDirection('right');
      setActiveGarageCardIndex((prevIndex) => 
        prevIndex === garages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [garages.length]);

  // Add smooth transition styles to your garage cards
  const cardTransitionStyles = {
    transition: 'opacity 0.5s ease-in-out',
  };

  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);
  const trailRef = useRef([]);

  useEffect(() => {
    const moveCursor = (e) => {
      const { clientX, clientY } = e;

      if (cursorDotRef.current && cursorRingRef.current) {
        cursorDotRef.current.style.transform = `translate(${clientX - 2.5}px, ${clientY - 2.5}px)`;
        cursorRingRef.current.style.transform = `translate(${clientX - 15}px, ${clientY - 15}px)`;
      }

      // Create trail effect
      const trailElement = document.createElement('div');
      trailElement.className = 'cursor-trail';
      trailElement.style.left = `${clientX}px`;
      trailElement.style.top = `${clientY}px`;
      document.body.appendChild(trailElement);

      trailRef.current.push(trailElement);

      
      setTimeout(() => {
        trailElement.remove();
        trailRef.current.shift();
      }, 500);
    };

    window.addEventListener('mousemove', moveCursor);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      trailRef.current.forEach((trail) => trail.remove());
    };
  }, []);

  useEffect(() => {
    // Add class when component mounts
    document.body.classList.add('custom-cursor-page');
    
    // Remove class when component unmounts
    return () => {
      document.body.classList.remove('custom-cursor-page');
    };
  }, []);

  return (
    <div className="HomepageContainer">
      <div className="cursor-dot" ref={cursorDotRef}></div>
      <div className="cursor-ring" ref={cursorRingRef}></div>
      <main className="HomepageMain">
      <header className="HomepageHeaderNav">
  <div className="HomepageHeaderNavLogo">
    {/* / Remove any existing logo imports and use this: */}
    <img src={`${import.meta.env.BASE_URL}logo.png`} alt="CarGuys Logo" />
  </div>
  <nav className="HomepageHeaderNavigation_custom">
  <NavLink
    to="/"
    className={({ isActive }) =>
      isActive ? "NavLink_custom navLinkActive_custom" : "NavLink_custom navLinkInactive_custom"
    }
  >
    Home
  </NavLink>
  <span className="HomepageNavbarDivider">|</span>
  <NavLink
    to="/Aboutus"
    className={({ isActive }) =>
      isActive ? "NavLink_custom navLinkActive_custom" : "NavLink_custom navLinkInactive_custom"
    }
  >
    About Us
  </NavLink>
  <span className="HomepageNavbarDivider">|</span>
  <NavLink
    to="/faq"
    className={({ isActive }) =>
      isActive ? "NavLink_custom navLinkActive_custom" : "NavLink_custom navLinkInactive_custom"
    }
  >
    FAQ
  </NavLink>
  <span className="HomepageNavbarDivider">|</span>
  <NavLink
    to="/contact-us"
    className={({ isActive }) =>
      isActive ? "NavLink_custom navLinkActive_custom" : "NavLink_custom navLinkInactive_custom"
    }
  >
    Contact Us
  </NavLink>
</nav>

  <div className="HomepageNavbarbuttons">
    <button className="HomepageNavbarbuttons_btn_login"  onClick={() => navigate("/login")}>
      Login
    </button>
    <button className="HomepageNavbarbuttons_btn_signup" onClick={() => navigate("/signup")}>
      Signup
    </button>
    <button className="HomepageNavbarbuttons_btn_registerGarage" onClick={() => navigate("/SignupGarage")}>
      Partner with CarGuys
    </button>
  </div>
</header>

<section className="testcirclesection">
  <div className="TestTextcirclesection">
  <h1 className="TestTextcirclesection_Text1">
              {texts[currentTextIndex]}
            </h1>
  
  </div>
  <div className="testcircle1"></div>
  <div className="testcircle2"></div>
  <div className="testcircle3"></div>
  </section>

      

        <section className="HomePageAttainingServiceSection">
        
  
  <div className="HomePageTabs">

            <button
              className={`HomePageTab ${activeTab === "gettingService" ? "gsactive" : ""}`}
              onClick={() => handleTabClick("gettingService")}
            >
              Getting service
            </button>
          
            <button
              className={`HomePageTab ${activeTab === "providingService" ? "psactive" : ""}`}
              onClick={() => handleTabClick("providingService")}
            >
              Providing service
            </button>
          </div>
         
          
          <div className="HomePageTabContent">
          {activeTab === "gettingService" && (
            <div className="HomePageTabContent_GettingService">
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                  scale: 1.0,
                  transition: {
                    duration: 0.6,
                    ease: "easeInOut",
                  },
                }}
                viewport={{ once: true, amount: 0.5 }}
              >
                <div className="HomePageTabContent_GettingService_1">
                  <div className="circle-container_gs1">
                    <div className="GettingServiceCircle1"></div>
                    <img
                      src="./icon/gs_c1.png"
                      className="GettingServiceCircle1_icon"
                      alt="sign up icon"
                    />
                  </div>
                  <div className="GetingService_gs1_text">
                    <p>Sign up or login with your user account</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 100 }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                  scale: 1.0,
                  transition: {
                    duration: 0.6,
                    ease: "easeInOut",
                  },
                }}
                viewport={{ once: true, amount: 0.5 }}
              >
                <div className="HomePageTabContent_GettingService_2">
                  <div className="GetingService_gs2_text">
                    <p>Browse and choose a garage of your liking from various options of garages registered on CarGuys</p>
                  </div>
                  <div className="circle-container_gs2">
                    <div className="GettingServiceCircle2"></div>
                    <img
                      src="./icon/gs_c2.png"
                      className="GettingServiceCircle2_icon"
                      alt="browse icon"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -100 }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                  scale: 1.0,
                  transition: {
                    duration: 0.6,
                    ease: "easeInOut",
                  },
                }}
                viewport={{ once: true, amount: 0.5 }}
              >
                <div className="HomePageTabContent_GettingService_3">
                  <div className="circle-container_gs3">
                    <div className="GettingServiceCircle3"></div>
                    <img
                      src="./icon/gs_c3.png"
                      className="GettingServiceCircle3_icon"
                      alt="book icon"
                    />
                  </div>
                  <div className="GetingService_gs3_text">
                    <p>Book a service with your chosen garage</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 100 }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                  scale: 1.0,
                  transition: {
                    duration: 0.6,
                    ease: "easeInOut",
                  },
                }}
                viewport={{ once: true, amount: 0.5 }}
              >
                <div className="HomePageTabContent_GettingService_4">
                  <div className="GetingService_gs4_text">
                    <p>Get your car serviced and leave a review</p>
                  </div>
                  <div className="circle-container_gs4">
                    <div className="GettingServiceCircle4"></div>
                    <img
                      src="./icon/gs_c4.png"
                      className="GettingServiceCircle4_icon"
                      alt="service icon"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {activeTab === "providingService" && (
            <div className="HomePageTabContent_ProvidingService">
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                  scale: 1.0,
                  transition: {
                    duration: 0.6,
                    ease: "easeInOut",
                  },
                }}
                viewport={{ once: true, amount: 0.5 }}
              >
                <div className="HomePageTabContent_ProvidingService_1">
                  <div className="circle-container_ps1">
                    <div className="ProvidingServiceCircle1"></div>
                    <img
                      src="./icon/ps_c1.png"
                      className="ProvidingServiceCircle1_icon"
                      alt="register icon"
                    />
                  </div>
                  <div className="ProvidingService_ps1_text">
                    <p>Register your garage and set up your profile with ease</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 100 }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                  scale: 1.0,
                  transition: {
                    duration: 0.6,
                    ease: "easeInOut",
                  },
                }}
                viewport={{ once: true, amount: 0.5 }}
              >
                <div className="HomePageTabContent_ProvidingService_2">
                  <div className="circle-container_ps2">
                    <div className="ProvidingServiceCircle2"></div>
                    <img
                      src="./icon/ps_c2.png"
                      className="ProvidingServiceCircle2_icon"
                      alt="service icon"
                    />
                  </div>
                  <div className="ProvidingService_ps2_text">
                    <p>Manage your services and bookings efficiently</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -100 }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                  scale: 1.0,
                  transition: {
                    duration: 0.6,
                    ease: "easeInOut",
                  },
                }}
                viewport={{ once: true, amount: 0.5 }}
              >
                <div className="HomePageTabContent_ProvidingService_3">
                  <div className="circle-container_ps3">
                    <div className="ProvidingServiceCircle3"></div>
                    <img
                      src="./icon/ps_c3.png"
                      className="ProvidingServiceCircle3_icon"
                      alt="manage icon"
                    />
                  </div>
                  <div className="ProvidingService_ps3_text">
                    <p>Communicate with customers and manage your business efficiently</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 100 }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                  scale: 1.0,
                  transition: {
                    duration: 0.6,
                    ease: "easeInOut",
                  },
                }}
                viewport={{ once: true, amount: 0.5 }}
              >
                <div className="HomePageTabContent_ProvidingService_4">
                  <div className="circle-container_ps4">
                    <div className="ProvidingServiceCircle4"></div>
                    <img
                      src="./icon/ps_c4.png"
                      className="ProvidingServiceCircle4_icon"
                      alt="review icon"
                    />
                  </div>
                  <div className="ProvidingService_ps4_text">
                    <p>Build your reputation through customer reviews and ratings</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

           
           
          </div>
         
        </section>

        <section className="HomepageGaragesSection">
      <div className="HomePageGaragesSection_Header">
        <p>
          Top-Rated Garages With 
          <span className="HomePageAttainingServiceSection_Header_highlight"> CarGuys </span>
        </p>
      </div>

      <div className="HomePageGaragesSection_GarageCarousel">
        {garages.length > 0 ? (
          <>
          

            <div className="garage-carousel" id="carousel-container">
              {garages.map((garage, index) => (
                <div
                  className={`garage-card ${
                    index === activeGarageCardIndex 
                      ? 'active' 
                      : index === (activeGarageCardIndex - 1 + garages.length) % garages.length 
                      ? 'previous' 
                      : ''
                  }`}
                  key={index}
                >
                  <img 
                    className="garage-card-image" 
                    src={garage.profileImageUrl || './default-garage.jpg'} 
                    alt="Garage" 
                  />
                  <div className="garage-card-writings">
                    <h2 className="garage-card-writings-garagename">{garage.garage_name}</h2>
                    <div className="star-rating">
                      {Array.from({ length: 5 }, (_, idx) => {
                        const fillLevel = Math.min(Math.max(garage.averageRating - idx, 0), 1);
                        return (
                          <div
                            key={idx}
                            className="star"
                            style={{
                              background: `linear-gradient(90deg, gold ${fillLevel * 100}%, #ddd ${fillLevel * 100}%)`,
                            }}
                          />
                        );
                      })}
                    </div>
                    <p className="garage-card-writings-description">{garage.description}</p>
                  </div>
                </div>
              ))}
            </div>

        
          </>
        ) : (
          <p>Loading garages...</p>
        )}
      </div>

      
    </section>

    <section className="HomepageUserSection">
  <div className="HomepageUserSection_Header">
    <p>
      <span className="HomepageUserSection_Header_highlight">Words </span>
       On The Streets
    </p>
  </div>

  <div className="ticker-wrap">
    <div className="ticker">
      
      {[...testimonials, ...testimonials].map((testimonial, index) => (
        <div key={index} className="ticker-item">
          <div className="user-card">
            <div className="user-card-writings">
              <img
                className="user-card-image"
                src={testimonial.image}
                alt={testimonial.name}
              />
              <h2 className="user-card-writings-garagename">{testimonial.name}</h2>
              <p className="user-card-writings-description">{testimonial.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>


<footer className="HomepageFooter">
  <div className="HomepageFootercontent">
    <h1>CarGuys</h1>
    <div className="HomepageFootercontent_middle">
    <p>Trust CarGuys with your vehicle. From pickup to delivery at your doorstep, we’ve got you covered every step of the way. Stranded on the road? No problem! Easily find and select a nearby garage at your location with just a few clicks. Whether you need routine maintenance or emergency repairs, CarGuys connects you with top-rated garages and expert services to get you back on the road quickly and safely.</p>

    </div>
    <hr />
    <p>© 2024 CarGuys. All Rights Reserved</p>
  </div>
</footer>
      </main>
    </div>
    
  );
}

export default HomePage;