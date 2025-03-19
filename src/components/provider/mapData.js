// Sample provider data
export const initialProviders = [
    { id: 1, name: "Provider A", lat: 40.7128, lng: -74.0060, type: "Exchange" },
    { id: 2, name: "Provider B", lat: 34.0522, lng: -118.2437, type: "Broker" },
    { id: 3, name: "Provider C", lat: 51.5074, lng: -0.1278, type: "Market Maker" },
    { id: 4, name: "Provider D", lat: 48.8566, lng: 2.3522, type: "Exchange" },
    { id: 5, name: "Provider E", lat: 35.6762, lng: 139.6503, type: "Broker" },
  ];
  
  // Provider types
  export const providerTypes = ["Exchange", "Broker", "Market Maker"];
  
  // Color mapping for provider types
  export const typeColors = {
    "Exchange": "#4285F4",  // Blue
    "Broker": "#DB4437",    // Red
    "Market Maker": "#0F9D58"  // Green
  };
  
  // Get marker icon for power grid tower
  export const getPowerGridIcon = (type) => {
    if (!window.google) return null;
    
    // Set color based on provider type
    const color = typeColors[type] || "#000000";
    
    // Create a path for a power tower
    return {
      path: "M16,0 L12,6 L20,6 L16,0 M12,7 L12,9 L9,9 L9,25 L11,25 L11,32 L13,32 L13,25 L19,25 L19,32 L21,32 L21,25 L23,25 L23,9 L20,9 L20,7 L12,7 M11,11 L21,11 L21,23 L11,23 L11,11",
      fillColor: color,
      fillOpacity: 1,
      strokeWeight: 0,
      scale: 1,
      anchor: new window.google.maps.Point(16, 32)
    };
  };