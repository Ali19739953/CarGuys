import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { firestore } from '../../../../firebaseConfig';

// Async thunk to fetch bookings
export const fetchUserBookings = createAsyncThunk(
    'booking/fetchUserBookings',
    async (userId) => {
        const bookingsRef = firestore.collection("BookingRequests");
        const snapshot = await bookingsRef.where("userId", "==", userId).get();
        const bookings = [];
        snapshot.forEach((doc) => {
            bookings.push({ id: doc.id, ...doc.data() });
        });
        return bookings;
    }
);

// Added a new thunk for garage bookings
export const fetchGarageBookings = createAsyncThunk(
    'booking/fetchGarageBookings',
    async (garageId) => {
        const bookingsRef = firestore.collection("BookingRequests");
        const snapshot = await bookingsRef.where("garageId", "==", garageId).get();
        const bookings = [];
        snapshot.forEach((doc) => {
            bookings.push({ id: doc.id, ...doc.data() });
        });
        return bookings;
    }
);

// Added new thunk
export const updateBookingStatusInFirestore = createAsyncThunk(
    'booking/updateBookingStatusInFirestore',
    async ({ id, status, price, deliveryDate }, { getState }) => {
        try {
            const bookingRef = firestore.collection("BookingRequests").doc(id);
            
            const updateData = {
                isPending: status === 'pending',
                isCompleted: status === 'completed',
                isOngoing: status === 'ongoing',
                price: Number(price) || 0,
                deliveryDate: deliveryDate || new Date().toISOString().split('T')[0],
                lastUpdated: new Date().toISOString()
            };

            console.log('Updating Firestore with:', updateData);
            
            await bookingRef.update(updateData);
            
            return { 
                id, 
                status, 
                price: updateData.price, 
                deliveryDate: updateData.deliveryDate 
            };
        } catch (error) {
            console.error('Firestore update error:', error);
            throw error;
        }
    }
);
//for ss user to cancel booking
export const cancelBooking = createAsyncThunk(
  'booking/cancelBooking',
  async (bookingId) => {
    try {
      // Update the booking status
      const bookingRef = firestore.collection('BookingRequests').doc(bookingId);
      const bookingDoc = await bookingRef.get();
      const bookingData = bookingDoc.data();
      
      await bookingRef.update({
        isPending: false,
        isOngoing: false,
        isCompleted: false,
        isCancelled: true,
        lastUpdated: new Date().toISOString()
      });

      // To Find and update/delete related notification
      const notificationsRef = firestore.collection('Notifications');
      const notificationQuery = await notificationsRef
        .where('additionalData.bookingId', '==', bookingId)
        .get();

      // Delete or update existing notifications
      const batch = firestore.batch();
      notificationQuery.forEach((doc) => {
        batch.delete(doc.ref);
      });

      //Create a new cancellation notification for the garage
      const newNotification = notificationsRef.doc();
      batch.set(newNotification, {
        recipientId: bookingData.garageId,
        type: 'BOOKING_CANCELLED',
        message: `Booking has been cancelled by ${bookingData.first_name} ${bookingData.last_name}`,
        additionalData: {
          bookingId: bookingId,
          garageName: bookingData.garageName,
          first_name: bookingData.first_name,
          last_name: bookingData.last_name
        },
        isRead: false,
        createdAt: new Date().toISOString()
      });

      await batch.commit();

      return bookingId;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }
);

// Added new thunk for rejecting bookings for garage users
export const rejectBooking = createAsyncThunk(
  'booking/rejectBooking',
  async ({ bookingId, rejectionReason }) => {
    try {
      const bookingRef = firestore.collection('BookingRequests').doc(bookingId);
      const bookingDoc = await bookingRef.get();
      const bookingData = bookingDoc.data();
      
      // Update booking status
      await bookingRef.update({
        isPending: false,
        isRejected: true,
        rejectionReason,
        rejectedAt: new Date().toISOString()
      });

      // Create notification for the service seeker
      const notificationsRef = firestore.collection('Notifications');
      await notificationsRef.add({
        recipientId: bookingData.userId,
        type: 'BOOKING_REJECTED',
        message: `Your service request has been rejected by ${bookingData.garageName}. Reason: ${rejectionReason}`,
        additionalData: {
          bookingId,
          garageName: bookingData.garageName,
          rejectionReason
        },
        isRead: false,
        createdAt: new Date().toISOString()
      });

      return { bookingId, rejectionReason };
    } catch (error) {
      console.error('Error rejecting booking:', error);
      throw error;
    }
  }
);

const bookingSlice = createSlice({
    name: "booking",
    initialState: {
        bookingRequests: [],
        currentBooking: {
            garageId: null,
            garageName: '',
            userId: null,
            selectedVehicle: null,
            selectedDate: '',
            selectedTime: '',
            selectedPayment: '',
            selectedServices: [],
            isPending: true,
            isCompleted: false,
            isOngoing: false
        },
        status: 'idle',
        error: null
    },
    reducers: {
        setBookingRequests: (state, action) => {
            state.bookingRequests = action.payload;
        },
        setCurrentBooking: (state, action) => {
            state.currentBooking = { ...state.currentBooking, ...action.payload };
        },
        addBookingRequest: (state, action) => {
            state.bookingRequests.push(action.payload);
        },
        updateBookingStatus: (state, action) => {
            const { id, status } = action.payload;
            const booking = state.bookingRequests.find(b => b.id === id);
            if (booking) {
                booking.isPending = status === 'pending';
                booking.isCompleted = status === 'completed';
                booking.isOngoing = status === 'ongoing';
            }
        },
        clearCurrentBooking: (state) => {
            state.currentBooking = {
                garageId: null,
                garageName: '',
                userId: null,
                selectedVehicle: null,
                selectedDate: '',
                selectedTime: '',
                selectedPayment: '',
                selectedServices: [],
                isPending: true,
                isCompleted: false,
                isOngoing: false
            };
        },
        resetBookingState: (state) => {
            state.currentBooking = null;
            // state.bookingRequests = [];
            state.status = 'idle';
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Handle user bookings
            .addCase(fetchUserBookings.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUserBookings.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.bookingRequests = action.payload;
            })
            .addCase(fetchUserBookings.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            // Handle garage bookings
            .addCase(fetchGarageBookings.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchGarageBookings.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.bookingRequests = action.payload;
            })
            .addCase(fetchGarageBookings.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            // Handle status change in Firestore
            .addCase(updateBookingStatusInFirestore.fulfilled, (state, action) => {
                const { id, status, price, deliveryDate } = action.payload;
                const booking = state.bookingRequests.find(b => b.id === id);
                if (booking) {
                    booking.isPending = status === 'pending';
                    booking.isCompleted = status === 'completed';
                    booking.isOngoing = status === 'ongoing';
                    booking.price = price;
                    booking.deliveryDate = deliveryDate;
                }
            })
            // Added these new cases for cancelBooking
            .addCase(cancelBooking.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(cancelBooking.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Update the cancelled booking in the state
                const booking = state.bookingRequests.find(b => b.id === action.payload);
                if (booking) {
                    booking.isPending = false;
                    booking.isOngoing = false;
                    booking.isCompleted = false;
                    booking.isCancelled = true;
                }
            })
            .addCase(cancelBooking.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            // Added these cases for rejecting bookings
            .addCase(rejectBooking.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(rejectBooking.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const booking = state.bookingRequests.find(b => b.id === action.payload.bookingId);
                if (booking) {
                    booking.isPending = false;
                    booking.isRejected = true;
                    booking.rejectionReason = action.payload.rejectionReason;
                }
            })
            .addCase(rejectBooking.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    }
});

export const { 
    setBookingRequests, 
    setCurrentBooking, 
    addBookingRequest, 
    updateBookingStatus, 
    clearCurrentBooking, 
    resetBookingState 
} = bookingSlice.actions;

export default bookingSlice.reducer;
