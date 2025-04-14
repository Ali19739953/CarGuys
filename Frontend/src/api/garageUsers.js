import { auth, firestore } from "../firebaseConfig";
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const fetchGarageDocument = async (uid) => {
  const garageRef = firestore.collection("Garage Users").doc(uid);
  const doc = await garageRef.get();
  if (doc.exists) {
    return doc.data();
  }
  console.log("No such document!");
  return null;
};
//function to fetch garage user data
const fetchGarageUserData = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const garageData = await fetchGarageDocument(user.uid);
          resolve({ garageData, isLoading: false });
        } catch (error) {
          console.error("Error fetching garage data:", error);
          reject(error);
        }
      } else {
        console.log("No user is signed in.");
        resolve({ garageData: null, isLoading: false });
      }
    });

    return () => unsubscribe();
  });
};
// Function to fetch garage details for a specific garage
const fetchGarageDetails = async (garageId) => {
  try {
    const garageDetailsRef = doc(firestore, "GarageDetails", garageId);
    const garageDetailsSnap = await getDoc(garageDetailsRef);
    return garageDetailsSnap.exists() ? garageDetailsSnap.data() : null;
  } catch (error) {
    console.error(`Error fetching details for garage ${garageId}:`, error);
    return null;
  }
};

// Modified function to fetch all garages with their details
export const fetchAllGarages = async () => {
  try {
    // Fetch basic garage data
    const garagesCollection = collection(firestore, "Garage Users");
    const garageSnapshot = await getDocs(garagesCollection);
    
    // Fetch details for each garage
    const garageList = await Promise.all(
      garageSnapshot.docs.map(async (doc) => {
        const garageData = {
          id: doc.id,
          ...doc.data()
        };
        
        // Fetch and add garage details including operating hours
        const garageDetails = await fetchGarageDetails(doc.id);
        
        return {
          ...garageData,
          operatingHours: garageDetails?.operatingHours || null,
          // Add other garage details as needed
          garageDetails // Include full garage details if needed
        };
      })
    );

    console.log("Fetched garages with details:", garageList);
    return garageList;
  } catch (error) {
    console.error("Error fetching garages:", error);
    throw error;
  }
};

export default fetchGarageUserData;
