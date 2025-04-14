import { createSlice } from '@reduxjs/toolkit';

const garageSlice = createSlice({
  name: 'garage',
  initialState: {
    garageDetails: null,
    reviews: [],
    loading: false,
    error: null,
  },
  reducers: {
    fetchGarageDetailsStart: (state) => {
      state.loading = true;
    },
    fetchGarageDetailsSuccess: (state, action) => {
      state.loading = false;
      state.garageDetails = action.payload;
    },
    fetchGarageDetailsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateGarageDetails: (state, action) => {
      state.garageDetails = { ...state.garageDetails, ...action.payload };
    },
    addReview: (state, action) => {
      state.reviews.push(action.payload);
    },
  },
});

export const { 
  fetchGarageDetailsStart, 
  fetchGarageDetailsSuccess, 
  fetchGarageDetailsFailure, 
  updateGarageDetails, 
  addReview 
} = garageSlice.actions;

export default garageSlice.reducer;