import { auth, firestore } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const fetchServiceSeekerDocument = async (uid) => {
  const serviceSeekerRef = doc(firestore, "ServiceSeekers Users", uid);
  const docSnap = await getDoc(serviceSeekerRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    // Convert Timestamps to milliseconds
    const serializedData = Object.entries(data).reduce((acc, [key, value]) => {
      acc[key] = value && typeof value.toMillis === 'function' ? value.toMillis() : value;
      return acc;
    }, {});
    return serializedData;
  }
  console.log("No such document!");
  return null;
};

const fetchServiceSeekerUserData = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const serviceSeekerData = await fetchServiceSeekerDocument(user.uid);
          if (serviceSeekerData) {
            resolve({ serviceSeekerData });
          } else {
            reject(new Error("User document not found in Firestore"));
          }
        } catch (error) {
          console.error("Error fetching service seeker data:", error);
          reject(error);
        }
      } else {
        console.log("No user is signed in.");
        resolve({ serviceSeekerData: null });
      }
      unsubscribe();
    });
  });
};

export default fetchServiceSeekerUserData;
