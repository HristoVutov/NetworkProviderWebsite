// Function to create a zigzag path between two points
export const createZigzagPath = (start, end) => {
  if (!window.google || !window.google.maps) return [];
  
  const numZigs = 5; // Number of zigzags
  const points = [];
  
  // Add starting point
  points.push(start);
  
  // Calculate direction vector
  const dx = end.lat - start.lat;
  const dy = end.lng - start.lng;
  
  // Create zigzag points
  for (let i = 1; i < numZigs; i++) {
    const ratio = i / numZigs;
    const midLat = start.lat + dx * ratio;
    const variation = (i % 2 === 0 ? 1 : -1) * 0.5; // Alternate zigzag direction
    const midLng = start.lng + dy * ratio + variation * (dy / numZigs);
    
    points.push({ lat: midLat, lng: midLng });
  }
  
  // Add ending point
  points.push(end);
  
  return points;
};

// Global registry of map initialization functions
export const mapInitRegistry = {
  functions: [],
  register: function(initFunction) {
    this.functions.push(initFunction);
    
    // If Maps API is already loaded, execute immediately
    if (window.google && window.google.maps) {
      initFunction();
    }
    // Otherwise, it will be executed when the API loads
  },
  executeAll: function() {
    this.functions.forEach(fn => fn());
  }
};

// Load Google Maps API
export const loadGoogleMapsApi = (callback) => {
  // If Google Maps is already loaded, just call the callback
  if (window.google && window.google.maps) {
    console.log("Google Maps already loaded");
    callback();
    return;
  }
  
  console.log("Loading Google Maps API...");
  
  // Define the global callback function
  window.initGoogleMaps = () => {
    console.log("Google Maps API loaded");
    
    // Execute all registered map initialization functions
    mapInitRegistry.executeAll();
    
    // Call the provided callback
    callback();
  };
  
  // Create script element to load Google Maps
  const script = document.createElement('script');
  console.log(`${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`)
  script.src = `https://maps.googleapis.com/maps/api/js?libraries=places&key=AIzaSyCs1iUcDiinH50sODNggW76LwWQC-hUnOY&callback=initGoogleMaps`;
  script.async = true;
  script.defer = true;
  
  script.onerror = () => {
    console.error("Failed to load Google Maps API");
    callback(new Error("Failed to load Google Maps API"));
  };
  
  document.head.appendChild(script);
};

// Create a map info window
export const createInfoWindow = (content) => {
  if (!window.google || !window.google.maps) return null;
  
  return new window.google.maps.InfoWindow({
    content: content
  });
};