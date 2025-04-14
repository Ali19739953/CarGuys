require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin with explicit path to avoid path issues
try {
  const serviceAccount = require('./firebase-service-account.json');
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase initialized successfully');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  process.exit(1);
}

// Initialize Firestore after Firebase is initialized
const firestore = admin.firestore();

const app = express();

// Enhanced CORS configuration
//added the cors to allow the frontend to access the backend
//added multiple origins to allow the frontend to access the backend
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5000'  
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  if (!endpointSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return res.status(500).send('Webhook secret not configured');
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log('Webhook event received:', event.type); // Add logging
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('Payment session completed:', session); 
    
    try {
      const bookingId = session.metadata.serviceId;
      console.log('Updating booking:', bookingId);
      
      // Update the Firestore document
      const docRef = firestore.collection('BookingRequests').doc(bookingId);
      await docRef.update({
        paymentDone: true,
        paymentDate: new Date().toISOString(),
        stripeSessionId: session.id
      });

      console.log('Payment success recorded for booking:', bookingId);
    } catch (error) {
      console.error('Error updating booking:', error);
      // Don't return here, as we still want to send a 200 response to Stripe
    }
  }

  res.json({received: true});
});

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Create payment session endpoint
app.post('/api/create-payment', async (req, res) => {
  try {
    const { amount, serviceId, garageId, userId, first_name, last_name, garageName } = req.body;

    // Input validation
    if (!amount || !serviceId || !garageId || !userId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Amount, serviceId, garageId, and userId are required'
      });
    }
//error checking for the amount
    if (amount <= 0) {
      return res.status(400).json({ 
        error: 'Invalid amount',
        details: 'Amount must be greater than 0'
      });
    }

    const origin = req.headers.origin;
    const allowedPorts = [5173, 5174, 5175];
    const baseUrl = allowedPorts.includes(new URL(origin).port) ? origin : 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'aed',
          product_data: {
            name: `Service Payment for: ${first_name} ${last_name} for ${serviceId}`,
            description: `Payment for service ${serviceId} at garage ${garageName}`,
          },
          unit_amount: Math.round(amount * 100), //to convert to decimal value
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${baseUrl}/ServiceSeekerHomepage?payment_status=success&session_id={CHECKOUT_SESSION_ID}&booking_id=${serviceId}`,
      cancel_url: `${baseUrl}/ServiceSeekerHomepage?payment_status=failure`,
      metadata: {
        serviceId,
        garageId,
        userId
      }
    });

    res.json({ 
      sessionId: session.id,
      paymentUrl: session.url 
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});