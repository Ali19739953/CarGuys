import axios from 'axios';
const geocodeCache = new Map();
let lastRequestTime = 0;
const RATE_LIMIT_DELAY = 1000;

const reverseGeocode = async (lat, lng) => {
  try {
    // Input validation
    if (!lat || !lng) {
      console.error("Invalid coordinates:", { lat, lng });
      return "Invalid coordinates";
    }

    // Checking cache first since it's faster
    const cacheKey = `${lat},${lng}`;
    if (geocodeCache.has(cacheKey)) {
      return geocodeCache.get(cacheKey);
    }

    // Implementing rate limiting since i had issues previously with the API
    const now = Date.now();
    const timeToWait = Math.max(0, RATE_LIMIT_DELAY - (now - lastRequestTime));
    if (timeToWait > 0) {
      await new Promise(resolve => setTimeout(resolve, timeToWait));
    }

    const LOCATIONIQ_API_KEY = 'pk.1cc1b4a15ab1770cd6d6bbc83447f89e';
    const response = await axios.get(`https://us1.locationiq.com/v1/reverse.php`, {
      params: {
        key: LOCATIONIQ_API_KEY,
        lat: lat,
        lon: lng,
        format: 'json'
      }
    });

    lastRequestTime = Date.now();

    if (response.data && response.data.display_name) {
      geocodeCache.set(cacheKey, response.data.display_name);
      return response.data.display_name;
    }

    return "Address not found";
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    if (error.response?.status === 429) {
      return "Too many requests, please try again later";
    }
    if (error.response?.status === 403) {
      return "API key error or quota exceeded";
    }
    return "Error fetching address";
  }
};

export default reverseGeocode;
