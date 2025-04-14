import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { firestore } from '../../../firebaseConfig';

// Async thunk for fetching all garage details
export const fetchAllGarageDetails = createAsyncThunk(
  'garageDetails/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const detailsRef = firestore.collection("GarageDetails");
      const snapshot = await detailsRef.get();
      const details = [];
      
      snapshot.forEach(doc => {
        details.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return details;
    } catch (error) {
      console.error("Error fetching garage details:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating garage details
export const updateGarageDetails = createAsyncThunk(
  'garageDetails/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const detailRef = firestore.collection("GarageDetails").doc(id);
      await detailRef.update(data);
      return { id, ...data };
    } catch (error) {
      console.error("Error updating garage details:", error);
      return rejectWithValue(error.message);
    }
  }
);

const garageDetailsSlice = createSlice({
  name: 'garageDetails',
  initialState: {
    details: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllGarageDetails.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllGarageDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.details = action.payload;
        state.error = null;
      })
      .addCase(fetchAllGarageDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateGarageDetails.fulfilled, (state, action) => {
        const index = state.details.findIndex(detail => detail.id === action.payload.id);
        if (index !== -1) {
          state.details[index] = action.payload;
        }
      });
  }
});

export const selectAllGarageDetails = (state) => state.garageDetails.details;
export const selectGarageDetailsStatus = (state) => state.garageDetails.status;
export const selectGarageDetailsError = (state) => state.garageDetails.error;

export default garageDetailsSlice.reducer;