//fixed the vehicleslice to handle the vehicles dynamically, passed the selected vehicle to the state prop in the booking service
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedVehicle: null,
  vehicles: [],
};

const vehicleSlice = createSlice({
  name: 'vehicle',
  initialState,
  reducers: {
    setSelectedVehicle: (state, action) => {
      state.selectedVehicle = action.payload;
    },
    clearSelectedVehicle: (state) => {
      state.selectedVehicle = null;
    },
    setVehicles: (state, action) => {
      state.vehicles = action.payload;
      if (!state.selectedVehicle && action.payload.length > 0) {
        state.selectedVehicle = {
          id: action.payload[0].id,
          make: action.payload[0].make,
          model: action.payload[0].model,
          year: action.payload[0].year,
          numberPlate: action.payload[0].numberPlate,
          imageUrl: action.payload[0].imageUrl || action.payload[0].vehicleImage
        };
      }
    },
  },
});

export const { setSelectedVehicle, clearSelectedVehicle, setVehicles } = vehicleSlice.actions;

export const selectSelectedVehicle = (state) => state.vehicle.selectedVehicle;
export const selectVehicles = (state) => state.vehicle.vehicles;

export default vehicleSlice.reducer;