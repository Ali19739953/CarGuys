import { configureStore } from '@reduxjs/toolkit';
import userReducer from './Features/SharedSlices/Users/userSlice';
import garageSlice from  "./Features/SharedSlices/Services/garageSlice"
import serviceSlice from "./Features/SharedSlices/Services/serviceSlice"
import vehicleSlice from "./Features/SharedSlices/Vehicles/vehicleSlice"
import bookingSlice from "./Features/SharedSlices/Bookings/bookingSlice"
import garageUsersSlice from './Features/SharedSlices/Users/garageUsers';
import garageDetailsSlice from './Features/Garage-interface/garageDetails';
import notificationSlice from "./Features/SharedSlices/Bookings/notificationSlice"
const store = configureStore({
  reducer: {
    user: userReducer,
    services: serviceSlice,
    garage: garageSlice,
    vehicle: vehicleSlice,
    notifications: notificationSlice,
    booking: bookingSlice,
    garageUsers: garageUsersSlice,
    garageDetails: garageDetailsSlice
  },
  //added middleware to handle notifications and avoid serializable errors
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['notifications/setupListener/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['notifications.unsubscribe'],
      },
    }),
});

export default store;