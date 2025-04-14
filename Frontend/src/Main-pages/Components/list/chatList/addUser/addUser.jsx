import styles from "./addUser.module.css";
import { firestore } from '@/firebaseConfig';
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { useState, useEffect } from "react";
import { useUserStore } from "../../../../lib/userStore";

const AddUser = () => {
  const [users, setUsers] = useState([]); // All relevant users
  const [message, setMessage] = useState("");
  const { currentUser } = useUserStore();

  const [isManualModalOpen, setIsManualModalOpen] = useState(false); // State for the manual addition modal
  const [manualInput, setManualInput] = useState(""); // User input for manual addition
  const [firstName, setFirstName] = useState(""); // For searching users
  const [lastName, setLastName] = useState(""); // For searching users

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setMessage("");

        if (!currentUser?.uid || !currentUser?.user_type) {
          console.error("Current user is not authenticated or missing user type.");
          return;
        }

        const fetchedUsers = [];
        const uniqueUserIds = new Set(); // To track unique IDs
        const bookingRequestsRef = firestore.collection("BookingRequests");

        if (currentUser.user_type === "GarageManagers") {
          // Fetch ServiceSeekers by garageId
          const bookingQuery = await bookingRequestsRef
            .where("garageId", "==", currentUser.uid)
            .get();

          if (bookingQuery.empty) {
            console.warn("No bookings found for garageId.");
            return;
          }

          for (const bookingDoc of bookingQuery.docs) {
            const bookingData = bookingDoc.data();
            const relevantUserId = bookingData.userId;

            if (uniqueUserIds.has(relevantUserId)) continue;
            uniqueUserIds.add(relevantUserId);

            const userRef = firestore.collection("ServiceSeekers Users").doc(relevantUserId);
            const userDoc = await userRef.get();

            if (userDoc.exists) {
              const userData = userDoc.data();
              fetchedUsers.push({ ...userData, id: userDoc.id });
            }
          }
        } else if (currentUser.user_type === "ServiceSeeker") {
          // Fetch Garages by userId
          const userBookingQuery = await bookingRequestsRef
            .where("userId", "==", currentUser.uid)
            .get();

          if (userBookingQuery.empty) {
            console.warn("No bookings found for userId.");
            return;
          }

          for (const bookingDoc of userBookingQuery.docs) {
            const bookingData = bookingDoc.data();
            const relevantGarageId = bookingData.garageId;

            if (uniqueUserIds.has(relevantGarageId)) continue;
            uniqueUserIds.add(relevantGarageId);

            const garageRef = firestore.collection("Garage Users").doc(relevantGarageId);
            const garageDoc = await garageRef.get();

            if (garageDoc.exists) {
              const garageData = garageDoc.data();
              fetchedUsers.push({ ...garageData, id: garageDoc.id });
            }
          }
        } else {
          console.warn("User type is not recognized.");
          return;
        }

        setUsers(fetchedUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, [currentUser]);

  const handleManualUserAddition = async () => {
    try {
      let query;
  
      if (currentUser.user_type === "GarageManagers") {
        // Ensure firstName and lastName are not empty
        if (!firstName || !lastName) {
          setMessage("Please provide both first and last names.");
          return;
        }
  
        // Validate that firstName and lastName are strings
        if (typeof firstName !== 'string' || typeof lastName !== 'string') {
          setMessage("First and Last names must be strings.");
          return;
        }
  
        console.log(`Querying ServiceSeekers Users with firstName: ${firstName}, lastName: ${lastName}`);
  
        // Build the query for Service Seekers based on first and last name
        query = firestore
          .collection("ServiceSeekers Users")
          .where("first_name", "==", firstName)
          .where("last_name", "==", lastName);
  
      } else if (currentUser.user_type === "ServiceSeeker") {
        // Ensure manualInput is not empty
        if (!manualInput) {
          setMessage("Please provide the garage name.");
          return;
        }
  
        // Validate that manualInput is a string
        if (typeof manualInput !== 'string') {
          setMessage("Garage name must be a string.");
          return;
        }
  
        console.log(`Querying Garage Users with garage name: ${manualInput}`);
  
        // Build the query for Garage Users based on garage name
        query = firestore
          .collection("Garage Users")
          .where("garage_name", "==", manualInput);
      } else {
        setMessage("User type is not recognized.");
        return;
      }
  
      // Check if the query object is valid
      if (!query) {
        setMessage("Error: Invalid query.");
        return;
      }
  
      // Perform the query
      const snapshot = await query.get();
  
      if (snapshot.empty) {
        setMessage("No user found with the provided details.");
        return;
      }
  
      snapshot.forEach((doc) => {
        const userData = doc.data();
        setUsers((prev) => [...prev, { ...userData, id: doc.id }]);
        setMessage("User added successfully to the list!");
      });
    } catch (err) {
      console.error("Error adding user manually:", err);
      setMessage("Error adding user manually.");
    }
  };
  

  const createChat = async (selectedUser) => {
    try {
      const userID = selectedUser.uid;
      const currentUserID = currentUser.uid;

      // Create a unique chat ID
      const chatId = [userID, currentUserID].sort().join('_');

      // Check if chat already exists
      const chatQuery = firestore.collection("chats").doc(chatId);
      const chatDoc = await chatQuery.get();

      if (chatDoc.exists) {
        setMessage(`Chat already exists with ${selectedUser.first_name || selectedUser.garage_name}.`);
        return;
      }

      // Create a new chat
      const chatRef = firestore.collection("chats").doc(chatId);
      await chatRef.set({
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        messages: [],
        participants: [userID, currentUserID],
      });

      // Update userchats for both participants
      const userChatsRef = firestore.collection("userchats").doc(userID);
      await userChatsRef.set({
        chats: firebase.firestore.FieldValue.arrayUnion({
          chatId: chatRef.id,
          lastMessage: "",
          isSeen: false,
          receiverId: currentUserID,
          updatedAt: Date.now(),
        }),
      }, { merge: true });

      const currentUserChatsRef = firestore.collection("userchats").doc(currentUserID);
      await currentUserChatsRef.set({
        chats: firebase.firestore.FieldValue.arrayUnion({
          chatId: chatRef.id,
          lastMessage: "",
          isSeen: true,
          receiverId: userID,
          updatedAt: Date.now(),
        }),
      }, { merge: true });

      setMessage(`Chat created successfully with ${selectedUser.garage_name || `${selectedUser.first_name} ${selectedUser.last_name}`}!`);
    } catch (err) {
      console.error("Error creating chat:", err);
    }
  };

  return (
    <div className={styles.ClientMessengerAdduseraddUser}>
      {message && <p>{message}</p>}

      {/* Display list of users in modal */}
      <div className={styles.Modal}>
        <h2>Select a User to Start a Chat</h2>
        <ul className={styles.UserList}>
          {users.map((user) => (
            <li key={user.id} className={styles.UserItem} onClick={() => createChat(user)}>
              <span>
                {user.garage_name 
                  ? user.garage_name 
                  : `${user.first_name || "Unknown"} ${user.last_name || "User"}`}
              </span>
            </li>
          ))}
        </ul>
        <button onClick={() => setIsManualModalOpen(true)}>Manually Add Users</button>
      </div>

      {/* Modal for manual user addition */}
      {isManualModalOpen && (
        <div className={styles.Modal}>
          <h2>Manual User Addition</h2>
          
          {/* Conditionally render input fields based on user type */}
          {currentUser.user_type === "ServiceSeeker" && (
            <input 
              type="text" 
              placeholder="Enter Garage Name" 
              value={manualInput} 
              onChange={(e) => setManualInput(e.target.value)} 
            />
          )}

          {currentUser.user_type === "GarageManagers" && (
            <>
              <input 
                type="text" 
                placeholder="Enter First Name" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
              />
              <input 
                type="text" 
                placeholder="Enter Last Name" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
              />
            </>
          )}
          
          <button onClick={handleManualUserAddition}>Add User</button>
          <button onClick={() => setIsManualModalOpen(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
