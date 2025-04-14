import React, { useEffect, useState } from 'react';
// import { firestore } from 'firebase'; 

function Popularity() {
  const [popularGarages, setPopularGarages] = useState([]);

  useEffect(() => {
    const fetchGarages = async () => {
      try {
        const snapshot = await firestore().collection('popularGarages').get();
        const garagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPopularGarages(garagesData);
      } catch (error) {
        console.error("Error fetching garages: ", error);
      }
    };

    fetchGarages();
  }, []);

  return (
    <div>
    
      <ul>
        {popularGarages.length === 0 ? (
          <p>No Popular garages available!</p> 
        ) : (
          popularGarages.map(garage => (
            <li key={garage.id}>{garage.name}</li> 
          ))
        )}
      </ul>
    </div>
  );
}

export default Popularity
