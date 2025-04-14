import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { firestore } from '../../../../firebaseConfig';

// Async thunk for fetching all garage users
export const fetchAllGarageUsers = createAsyncThunk(
  'garageUsers/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const garagesRef = firestore.collection("Garage Users");
      const snapshot = await garagesRef.get();
      const garages = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        // Convert Timestamp to regular date string
        const processedData = Object.entries(data).reduce((acc, [key, value]) => {
          // Check if the value is a Timestamp
          if (value && typeof value.toDate === 'function') {
            acc[key] = value.toDate().toISOString();
          } else {
            acc[key] = value;
          }
          return acc;
        }, {});

        garages.push({
          id: doc.id,
          ...processedData
        });
      });
      
      return garages;
    } catch (error) {
      console.error("Error fetching garage users:", error);
      return rejectWithValue(error.message);
    }
  }
);

const garageUsersSlice = createSlice({
  name: 'garageUsers',
  initialState: {
    garages: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllGarageUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllGarageUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.garages = action.payload;
        state.error = null;
      })
      .addCase(fetchAllGarageUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const selectAllGarageUsers = (state) => state.garageUsers.garages;
export const selectGarageUsersStatus = (state) => state.garageUsers.status;
export const selectGarageUsersError = (state) => state.garageUsers.error;

export default garageUsersSlice.reducer;