import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { firestore } from '@/firebaseConfig'; 
import { auth } from '@/firebaseConfig'; 

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,

  fetchUserInfo: async () => {
    const user = auth.currentUser; 
    const uid = user ? user.uid : null; 

    console.log("Current User from Auth:", user);
    console.log("UID being used:", uid);

    if (!uid) {
      console.log("No UID provided from auth.currentUser");
      return set({ currentUser: null, isLoading: false });
    }

    
    const collections = ["ServiceSeekers Users", "Garage Users"];
    
    try {
      let userData = null;

      
      for (const collectionName of collections) {
        console.log(`Searching in collection: ${collectionName} for UID: ${uid}`);

        const docRef = doc(firestore, collectionName, uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log(`User found in collection: ${collectionName}`);
          userData = { ...docSnap.data(), uid }; 

          
          if (collectionName === "Garage Users") {
            userData.avatar = userData.profileImageUrl || "./avatar.png";
            console.log("Garage avatar found:", userData.avatar);
          } else if (collectionName === "ServiceSeekers Users") {
            userData.avatar = userData.profileImageUrl || "./avatar.png"; 
          }
          break; 
        } else {
          console.log(`No document found in collection: ${collectionName} for UID: ${uid}`);
        }
      }

      if (userData) {
        console.log("User data found:", userData);
        set({ currentUser: userData, isLoading: false });
      } else {
        console.log("No user data found after checking all collections");
        set({ currentUser: null, isLoading: false });
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
      set({ currentUser: null, isLoading: false });
    }
  },
}));
