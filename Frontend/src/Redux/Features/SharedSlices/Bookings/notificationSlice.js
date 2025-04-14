import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { firestore } from '../../../../firebaseConfig';

// Added a new function to filter notifications based on user type
const filterNotificationsForUser = (notifications, userType) => {
  // Defined notification types each user type should see
  //still some issues with this, i need to fix it
  const userTypeNotifications = {
    serviceSeeker: ['SERVICE_ONGOING', 'SERVICE_COMPLETED', 'SERVICE_REJECTED', 'CONTRACT_GENERATED', 'PAYMENT_REQUEST', 'COD_PICKUP_REMINDER'],
    garage: ['BOOKING_REQUEST', 'NEW_BOOKING_REQUEST', 'BOOKING_CANCELLED']
  };

  return notifications.filter(notification => 
    userTypeNotifications[userType]?.includes(notification.type)
  );
};

// Fetch notifications for a specific recipient (garage or user)
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async ({ recipientId, userType }) => {
    try {
      console.log('Fetching notifications for recipientId:', recipientId);
      const notificationsRef = firestore.collection("Notifications");
      
      // Added strict equality check for recipientId
      const snapshot = await notificationsRef
        .where("recipientId", "==", recipientId)
        .orderBy("timestamp", "desc")
        .limit(50)
        .get();
      
      console.log('Query snapshot:', {
        empty: snapshot.empty,
        size: snapshot.size,
        recipientId: recipientId
      });
      
      const notifications = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Double check to see if recipientId matches
        if (data.recipientId === recipientId) {
          notifications.push({ id: doc.id, ...data });
        }
      });
      
      console.log('Fetched notifications for garage:', {
        garageId: recipientId,
        notificationCount: notifications.length
      });
      
      return filterNotificationsForUser(notifications, userType);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }
);

// Create a new notification
export const createNotification = createAsyncThunk(
  'notifications/createNotification',
  async (notificationData) => {
    try {
      console.log('Creating notification in Firestore:', notificationData);
      
      // Verify the collection exists or create it
      const notificationsRef = firestore.collection("Notifications");
      
      const notification = {
        ...notificationData,
        timestamp: new Date().toISOString(),
        isRead: false
      };
      
      console.log('Final notification data:', notification);
      
      const docRef = await notificationsRef.add(notification);
      console.log('Notification created with ID:', docRef.id);
      
      return { id: docRef.id, ...notification };
    } catch (error) {
      console.error("Error creating notification:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
);

// Mark notification as read
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId) => {
    try {
      await firestore.collection("Notifications")
        .doc(notificationId)
        .update({ isRead: true });
      return notificationId;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }
);

// Added new action for real-time listener
export const setupNotificationListener = createAsyncThunk(
  'notifications/setupListener',
  async ({ recipientId, userType }, { dispatch }) => {
    try {
      const unsubscribe = firestore.collection("Notifications")
        .where("recipientId", "==", recipientId)
        .orderBy("timestamp", "desc")
        .onSnapshot(
          (snapshot) => {
            const notifications = [];
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                notifications.push({
                  id: change.doc.id,
                  ...change.doc.data()
                });
              }
            });
            // Filter notifications based on user type before dispatching
            const filteredNotifications = filterNotificationsForUser(notifications, userType);
            dispatch(updateNotifications(filteredNotifications));
          },
          (error) => {
            console.error("Error in notification listener:", error);
          }
        );

      return unsubscribe;
    } catch (error) {
      console.error("Error setting up notification listener:", error);
      throw error;
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    notifications: [],
    status: 'idle',
    error: null,
    unsubscribe: null
  },
  reducers: {
    updateNotifications: (state, action) => {
      // Merging new notifications with existing ones, avoiding duplicates
      const newNotifications = action.payload;
      const existingIds = new Set(state.notifications.map(n => n.id));
      const uniqueNewNotifications = newNotifications.filter(n => !existingIds.has(n.id));
      state.notifications = [...state.notifications, ...uniqueNewNotifications];
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createNotification.fulfilled, (state, action) => {
        state.notifications.unshift(action.payload);
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification) {
          notification.isRead = true;
        }
      })
      .addCase(setupNotificationListener.fulfilled, (state, action) => {
        state.unsubscribe = action.payload;
      });
  }
});

export const { updateNotifications, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;