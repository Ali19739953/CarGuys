import { createSlice } from "@reduxjs/toolkit";
import PendingServices from "../../../../Garage-Interface/Pages/PendingServices";
import CompletedServices from "../../../../Garage-Interface/Pages/CompletedServices";
const serviceSlice = createSlice({
    name : `services`,
    initialState:{
        PendingServices:[],
        ongoingServices:[],
        CompletedServices:[],
    },
    reducers: {
        fetchServicesStart: (state) => {
          state.loading = true;
        },
        fetchServicesSuccess: (state, action) => {
          state.loading = false;
          state.PendingServices = action.payload.pendingServices;
          state.ongoingServices = action.payload.ongoingServices;
          state.CompletedServices = action.payload.completedServices;
        },
        fetchServicesFailure: (state, action) => {
          state.loading = false;
          state.error = action.payload;
        },
        addService: (state, action) => {
          state.PendingServices.push(action.payload);
        },
        updateServiceStatus: (state, action) => {
          // Logic implemente here.
        },
      },
    });
    
    export const { 
      fetchServicesStart, 
      fetchServicesSuccess, 
      fetchServicesFailure, 
      addService, 
      updateServiceStatus 
    } = serviceSlice.actions;
    
    export default serviceSlice.reducer;