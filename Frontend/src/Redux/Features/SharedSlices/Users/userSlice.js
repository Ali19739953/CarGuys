import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    isAuthenticated: false,
    userInfo: null,
    userType: null, // Add userType to differentiate between interfaces
    garageDetails: null, 
    loading: false,
    error: null,
  },
  reducers: {
    loginRequest: (state) => {
      state.loading = true;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.userInfo = action.payload;
      state.userType = action.payload.user_type; // Set userType from payload
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.userInfo = null;
      state.userType = null; // Reset userType on logout
    },
    setGarageDetails: (state, action) => {
      state.garageDetails = action.payload;
    },
    setUserAuthenticated: (state, action) => { 
      state.isAuthenticated = action.payload;
    },
    setUserData: (state, action) => {
      const serializeTimestamps = (obj) => {
        const newObj = {};
        for (const [key, value] of Object.entries(obj)) {
          if (value && typeof value.toMillis === 'function') {
            newObj[key] = value.toMillis();
          } else if (value && typeof value === 'object') {
            newObj[key] = serializeTimestamps(value);
          } else {
            newObj[key] = value;
          }
        }
        return newObj;
      };

      const serializedData = serializeTimestamps(action.payload);
      state.userInfo = {
        ...serializedData,
        user_id: action.payload.user_id || action.payload.uid || serializedData.user_id || serializedData.uid
      };
    },
  },
});

// Export actions
export const { loginRequest, loginSuccess, loginFailure, logout, setGarageDetails, setUserAuthenticated, setUserData } = userSlice.actions;

// Selectors
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectUserType = (state) => state.user.userType; 
export const selectUserInfo = (state) => state.user.userInfo; 
export const selectGarageDetails = (state) => state.user.garageDetails; 

export default userSlice.reducer;