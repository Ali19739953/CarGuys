import React, { useEffect, useState } from 'react'
import { getFirestore, collection, getDocs } from 'firebase/firestore'

const Leastbuy = () => {
  const [LeastbuyGarages, setLeastbuyGarages] = useState([]);

  useEffect(() => {
    const fetchGarages = async () => {
      try {
        const db = getFirestore();
        const garagesCollection = collection(db, 'garages');
        const garageSnapshot = await getDocs(garagesCollection);
        const garageList = garageSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLeastbuyGarages(garageList);
      } catch (err) {
        setError('Database not connected');
      }
    };

    fetchGarages();
  }, []);

  return (
    <div>
  
      <ul>
        {LeastbuyGarages.length === 0 ? ( 
          <p>No garages available!</p> 
        ) : (
          LeastbuyGarages.map(garage => ( 
            <li key={garage.id}>{garage.name}</li>
          ))
        )}
      </ul>
    </div>
  );
}

export default Leastbuy
