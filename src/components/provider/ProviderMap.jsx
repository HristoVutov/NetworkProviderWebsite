import React, { useState, useRef, useEffect } from "react";
import { Stack, Spinner, SpinnerSize, MessageBar, MessageBarType } from '@fluentui/react';
import axios from "axios";
import Header from "../common/Header";
import SidePanel from "./SidePanel";
import MapControls from "./MapControls";
import { styles } from "./mapStyles";
import { providerTypes } from "./mapData";
import { createZigzagPath, loadGoogleMapsApi, createInfoWindow } from "./mapUtils";

const ProviderMap = () => {
// State variables
const [isMapLoaded, setIsMapLoaded] = useState(false);
const [isDataLoaded, setIsDataLoaded] = useState(false);
const [mapError, setMapError] = useState(null);
const [providers, setProviders] = useState([]);
const [connections, setConnections] = useState([]);
const [isAddingMarker, setIsAddingMarker] = useState(false);
const [isSelectingMarkers, setIsSelectingMarkers] = useState(false);
const [statusMessage, setStatusMessage] = useState(null);

// Refs
const activeInfoWindowRef = useRef(null);
const mapRef = useRef(null);
const googleMapRef = useRef(null);
const clickListenerRef = useRef(null);
const markersRef = useRef([]);
const isSelectingMarkersRef = useRef(false); // Ref to track selection mode
const selectedMarkersRef = useRef([]); // Ref to track selected markers
const fetchProviderData = async () => {
  try {
    const response = await axios.get('http://localhost:3001/api/point');
    const apiData = response.data;
    
    console.log("API data:", apiData);
    
    // Update transformation to include all fields from the JSON data
    const transformedData = apiData.map((item, index) => {
      return {
        id: item._id,
        name: item.Name, // Use the actual Name from the data
        address: item.Address,
        zone: item.Zone,
        phone1: item.Phone1,
        phone2: item.Phone2,
        ip: item.IP,
        lat: parseFloat(item.Lat),
        lng: parseFloat(item.Lng),
        type: providerTypes[Math.floor(Math.random() * providerTypes.length)],
        providerId: item.Provider,
        previousPoint: item.PreviousPoint,
        status: item.Status
      };
    });
    
    setProviders(transformedData);
    setIsDataLoaded(true);
    
    // If map is already loaded, add markers for the fetched providers
    if (googleMapRef.current && window.google) {
      addMarkersToMap(transformedData);
      
      // After adding markers, create connections based on PreviousPoint property
      createInitialConnections(transformedData, apiData);
    }
    
  } catch (error) {
    console.error("Error fetching provider data:", error);
    setMapError("Failed to load provider data. Please try again later.");
  }
};

// Function to create initial connections based on PreviousPoint property
const createInitialConnections = (providerData, rawData) => {
  console.log("Creating initial connections based on PreviousPoint property");
  
  // Create a map of provider IDs to provider objects for easy lookup
  const providerMap = {};
  providerData.forEach(provider => {
    providerMap[provider.id] = provider;
  });
  
  // Connect markers based on PreviousPoint property
  let connectionCount = 0;
  
  providerData.forEach(provider => {
    if (provider.previousPoint) {
      console.log(`Provider ${provider.name} has previous point: ${provider.previousPoint}`);
      
      // Find the previous provider
      const previousProvider = providerMap[provider.previousPoint];
      
      if (previousProvider) {
        console.log(`Connecting ${provider.name} to ${previousProvider.name}`);
        
        // Create visual connection
        try {
          connectMarkers(previousProvider, provider, false); // false = don't send to API
          connectionCount++;
        } catch (error) {
          console.error(`Error connecting markers: ${error.message}`);
        }
      } else {
        console.warn(`Previous provider not found: ${provider.previousPoint}`);
      }
    }
  });
  
  console.log(`Created ${connectionCount} initial connections`);
};

// Function to add markers to the map
const addMarkersToMap = (providerData) => {
  // Clear existing markers
  markersRef.current.forEach(marker => {
    marker.setMap(null);
  });
  markersRef.current = [];
  
  // Add markers for providers
  providerData.forEach((provider, index) => {
    console.log(`Creating marker ${index} for ${provider.name} at ${provider.lat},${provider.lng}`);
    
    // Create marker with standard icon
    const marker = new window.google.maps.Marker({
      position: { lat: provider.lat, lng: provider.lng },
      map: googleMapRef.current,
      title: provider.name,
    });
    
    // Store provider data directly on the marker for easy access
    marker.provider = provider;
    console.log(provider)
    // Add info window
    const infoContent = `
    <div style="padding: 12px; max-width: 300px;">
      <h3 style="margin: 0 0 8px 0; border-bottom: 1px solid #eee; padding-bottom: 5px;">${provider.name}</h3>
      <p style="margin: 4px 0;"><strong>Address:</strong> ${provider.address || 'N/A'}</p>
      <p style="margin: 4px 0;"><strong>Zone:</strong> ${provider.zone || 'N/A'}</p>
      <p style="margin: 4px 0;"><strong>Phone 1:</strong> ${provider.phone1 || 'N/A'}</p>
      <p style="margin: 4px 0;"><strong>Phone 2:</strong> ${provider.phone2 || 'N/A'}</p>
      <p style="margin: 4px 0;"><strong>IP:</strong> ${provider.ip || 'N/A'}</p>
      <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: ${provider.status === 'Running' ? 'green' : 'red'};">${provider.status || 'Unknown'}</span></p>
      <p style="margin: 4px 0; font-size: 0.9em; color: #666;">Location: ${provider.lat.toFixed(6)}, ${provider.lng.toFixed(6)}</p>
    </div>
  `;
    
    const infoWindow = createInfoWindow(infoContent);
    
    marker.addListener('click', () => {
      // Always check the current value from the ref, not the state captured in closure
      console.log("Marker clicked, isSelectingMarkers (ref):", isSelectingMarkersRef.current);
      
      // Handle marker selection if in selection mode
      if (isSelectingMarkersRef.current) {
        handleMarkerSelection(marker, provider);
      } else {
        // Otherwise show info window
        openInfoWindow(infoWindow, marker);
      }
    });
    
    // Store marker reference
    markersRef.current.push(marker);
  });
  
  console.log(`Added ${markersRef.current.length} markers to the map`);
};

// Function to handle marker selection for connections
const handleMarkerSelection = (marker, provider) => {
  // Exit if not in selection mode (extra safety check)
  if (!isSelectingMarkersRef.current) {
    console.log("Not in selection mode, ignoring marker click");
    return;
  }
  
  console.log(`Marker selected: ${provider.name} (${provider.id})`);
  
  // Check if this marker is already selected
  if (selectedMarkersRef.current.some(m => m.id === provider.id)) {
    console.log("Marker already in selection, ignoring");
    return;
  }
  
  // Highlight the selected marker
  marker.setIcon({
    path: window.google.maps.SymbolPath.CIRCLE,
    fillColor: '#0078d4',
    fillOpacity: 1,
    strokeWeight: 2,
    strokeColor: '#ffffff',
    scale: 10
  });
  
  // Add the marker to our selection
  selectedMarkersRef.current.push(provider);
  console.log(`Current selection: ${selectedMarkersRef.current.map(m => m.name).join(', ')}`);
  
  // If we have two markers selected, create the connection
  if (selectedMarkersRef.current.length === 2) {
    try {
      const [provider1, provider2] = selectedMarkersRef.current;
      console.log(`Connecting ${provider1.name} to ${provider2.name}`);
      
      // Create the visual connection
      connectMarkers(provider1, provider2);
      
      // Send connection data to API
      sendConnectionToAPI(provider1.id, provider2.id).then(success => {
        if (success) {
          console.log(`Connection between ${provider1.id} and ${provider2.id} saved to server`);
          
          // Show success message
          setStatusMessage({
            type: MessageBarType.success,
            text: `Connected ${provider1.name} to ${provider2.name} and saved to server`
          });
        }
      });
      
      // Reset all marker icons
      markersRef.current.forEach(m => {
        m.setIcon(null);
      });
      
      // Exit selection mode - update both state and ref
      isSelectingMarkersRef.current = false;
      setIsSelectingMarkers(false); // Only used for UI updates
      
      // Clear selection
      selectedMarkersRef.current = [];
      
      console.log("Connection complete, exited selection mode");
    } catch (error) {
      console.error("Connection error:", error);
      setStatusMessage({
        type: MessageBarType.error,
        text: `Connection failed: ${error.message}`
      });
      
      // Reset on error
      markersRef.current.forEach(m => {
        m.setIcon(null);
      });
      
      // Exit selection mode - update both state and ref
      isSelectingMarkersRef.current = false;
      setIsSelectingMarkers(false);
      
      // Clear selection
      selectedMarkersRef.current = [];
    }
  } else {
    // Guide the user to select the second marker
    setStatusMessage({
      type: MessageBarType.info,
      text: 'Now select a second marker to connect'
    });
  }
};

// Function to send connection data to API
const sendConnectionToAPI = async (marker1Id, marker2Id) => {
  try {
    // Get auth token from cookie
    const authToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1];
      
    if (!authToken) {
      console.error("No auth token found for API request");
      setStatusMessage({
        type: MessageBarType.warning,
        text: 'Authentication required to save connection'
      });
      return false;
    }

    // Send the connection request
    const url = `http://localhost:3001/api/point/${marker1Id}/connect/${marker2Id}`;
    console.log(`Sending connection request to: ${url}`);
    
    const response = await axios.put(
      url, 
      {}, // Empty body
      {
        headers: {
          'auth-token': authToken
        }
      }
    );
    
    console.log('API connection response:', response.data);
    return true;
  } catch (error) {
    console.error('Error sending connection to API:', error);
    setStatusMessage({
      type: MessageBarType.error,
      text: `Failed to save connection to server: ${error.response?.data?.message || error.message}`
    });
    return false;
  }
};

// Function to add a marker at specific coordinates
const addMarkerAt = (lat, lng) => {
  if (!googleMapRef.current || !window.google || !window.google.maps) {
    console.error("Google Maps not available");
    return;
  }
  
  // Get random provider type
  const randomType = providerTypes[Math.floor(Math.random() * providerTypes.length)];
  
  // Create new provider
  const newProviderId = Date.now().toString(); // Temporary ID until API responds
  const newProvider = {
    id: newProviderId,
    name: `Provider ${providers.length + 1}`,
    lat: lat,
    lng: lng,
    type: randomType
  };
  
  // Create marker with standard icon
  const marker = new window.google.maps.Marker({
    position: { lat: lat, lng: lng },
    map: googleMapRef.current,
    title: newProvider.name,
    animation: window.google.maps.Animation.DROP,
    provider: newProvider
  });
  
  // Add info window
  const infoContent = `
    <div style="padding: 8px;">
      <h3 style="margin: 0 0 8px 0;">${newProvider.name}</h3>
      <p style="margin: 0;">Type: ${newProvider.type}</p>
      <p style="margin: 0;">Position: ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
    </div>
  `;
  
  const infoWindow = createInfoWindow(infoContent);
  
  marker.addListener('click', () => {
    // Handle marker selection if in selection mode
    if (isSelectingMarkers) {
      handleMarkerSelection(marker, newProvider);
    } else {
      // Otherwise show info window
      openInfoWindow(infoWindow, marker);
    }
  });
  
  // Store marker reference
  markersRef.current.push(marker);
  
  // Update providers state
  setProviders(prevProviders => [...prevProviders, newProvider]);

  // Send coordinates to API
  sendCoordinatesToAPI(lat, lng);

  return newProvider;
};

// Function to open info window
const openInfoWindow = (infoWindow, marker) => {
  // Close any currently open info window
  if (activeInfoWindowRef.current) {
    activeInfoWindowRef.current.close();
  }
  
  // Open the new info window
  infoWindow.open(googleMapRef.current, marker);
  
  // Update the reference to the currently open info window
  activeInfoWindowRef.current = infoWindow;
};

// Function to send coordinates to API
const sendCoordinatesToAPI = async (lat, lng) => {
  try {
    // Get auth token from cookie
    const authToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1];
      
    if (!authToken) {
      // Redirect to login if no auth token
      setStatusMessage({
        type: MessageBarType.warning,
        text: 'Please login to add markers. Redirecting to login page...'
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = '/account/login';
      }, 2000);
      
      return;
    }

    // Send request with auth token
    const response = await axios.post('http://localhost:3001/api/point', {
      lat: lat,
      lng: lng
    }, {
      headers: {
        'auth-token': authToken
      }
    });
    
    console.log('API response:', response.data);
    setStatusMessage({
      type: MessageBarType.success,
      text: 'Marker added and coordinates sent to API successfully!'
    });
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setStatusMessage(null);
    }, 3000);
    
    // Refresh data from API to get the new marker with its server-assigned ID
    fetchProviderData();
    
  } catch (error) {
    console.error('Error sending coordinates to API:', error);
    
    // Handle unauthorized errors
    if (error.response && error.response.status === 401) {
      setStatusMessage({
        type: MessageBarType.error,
        text: 'You are not authorized. Please login again.'
      });
      
      // Clear invalid token
      document.cookie = 'auth-token=; path=/; max-age=0';
      
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = '/account/login';
      }, 2000);
    } else {
      setStatusMessage({
        type: MessageBarType.error,
        text: 'Failed to send coordinates to API. Please try again.'
      });
    }
  }
};

// Function to toggle marker addition mode
const handleAddMarkerMode = () => {
  // Exit selection mode if active
  if (isSelectingMarkersRef.current) {
    cancelSelectionMode();
  }
  
  // If we're already in adding marker mode, turn it off
  if (isAddingMarker) {
    setIsAddingMarker(false);
    setStatusMessage(null);
    
    // Remove the click listener if it exists
    if (clickListenerRef.current) {
      window.google.maps.event.removeListener(clickListenerRef.current);
      clickListenerRef.current = null;
    }
    return;
  }
  
  // Turn on adding marker mode
  setIsAddingMarker(true);
  setStatusMessage({
    type: MessageBarType.info,
    text: 'Click anywhere on the map to add a marker'
  });
  
  // Add a click listener to the map if it doesn't exist
  if (!clickListenerRef.current && googleMapRef.current) {
    clickListenerRef.current = googleMapRef.current.addListener('click', (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      // Add marker and send to API
      addMarkerAt(lat, lng);
      
      // Turn off adding marker mode after adding
      setIsAddingMarker(false);
      
      // Remove the click listener
      window.google.maps.event.removeListener(clickListenerRef.current);
      clickListenerRef.current = null;
    });
  }
};

// Function to make a polyline blink
const makePolylineBlink = (polyline) => {
  // Create a reference for the interval ID so we can clear it later
  let timerId = null;
  const blinkInterval = 800; // Blinking interval in milliseconds
  let visible = true;
  
  // Start the blinking interval
  timerId = setInterval(() => {
    // Toggle visibility by changing opacity
    visible = !visible;
    polyline.setOptions({
      strokeOpacity: visible ? 1.0 : 0.2
    });
  }, blinkInterval);
  
  // Return the timer ID so it can be cleared later
  return timerId;
};

// Function to connect two markers selected by the user
const connectMarkers = (provider1, provider2, sendToApi = true) => {
  if (!googleMapRef.current) {
    throw new Error("Map not initialized");
  }
  
  console.log(`Creating connection: ${provider1.name} → ${provider2.name}`);
  
  try {
    // Validate coordinates
    if (!provider1.lat || !provider1.lng || !provider2.lat || !provider2.lng) {
      throw new Error("Invalid marker coordinates");
    }
    
    // Create a straight line path between the markers
    const path = [
      { lat: provider1.lat, lng: provider1.lng },
      { lat: provider2.lat, lng: provider2.lng }
    ];
    
    // Determine line color based on markers' status
    const bothStopped = (provider1.status === "Stopped" && provider2.status === "Stopped");
    const lineColor = bothStopped ? '#FF0000' : '#00CC00'; // Red if both stopped, otherwise Green
    
    // Create the polyline with appropriate color
    const connectionId = connections.length + 1;
    const polyline = new window.google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: lineColor, // Dynamic color based on status
      strokeOpacity: 1.0,
      strokeWeight: 4,
      map: googleMapRef.current
    });
    
    // Start blinking if both providers are stopped
    let blinkTimerId = null;
    if (bothStopped) {
      blinkTimerId = makePolylineBlink(polyline);
    }
    
    // Calculate midpoint for info window
    const midpoint = {
      lat: (provider1.lat + provider2.lat) / 2,
      lng: (provider1.lng + provider2.lng) / 2
    };
    
    // Create info window content
    const infoContent = `
      <div style="padding: 8px;">
        <h3 style="margin: 0 0 8px 0;">Connection ${connectionId}</h3>
        <p style="margin: 0;">From: ${provider1.name} (${provider1.type})</p>
        <p style="margin: 0;">To: ${provider2.name} (${provider2.type})</p>
        ${provider1.status ? `<p style="margin: 0;">Status From: ${provider1.status || 'Unknown'}</p>` : ''}
        ${provider2.status ? `<p style="margin: 0;">Status To: ${provider2.status || 'Unknown'}</p>` : ''}
      </div>
    `;
    
    // Create and position the info window
    const infoWindow = createInfoWindow(infoContent);
    infoWindow.setPosition(midpoint);
    
    // Add click listener to the polyline
    polyline.addListener('click', () => {
      if (activeInfoWindowRef.current) {
        activeInfoWindowRef.current.close();
      }
      infoWindow.open(googleMapRef.current);
      activeInfoWindowRef.current = infoWindow;
    });
    
    // Store connection information
    const newConnection = {
      id: connectionId,
      from: provider1.id,
      to: provider2.id,
      polyline: polyline,
      bothStopped: bothStopped,
      blinkTimerId: blinkTimerId // Store the timer ID for cleanup
    };
    
    // Update connections state
    setConnections(prev => [...prev, newConnection]);
    
    // Only send to API if explicitly requested (for manual connections)
    if (sendToApi) {
      // Show success message
      setStatusMessage({
        type: MessageBarType.success,
        text: `Connected ${provider1.name} to ${provider2.name}`
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    }
    
    return polyline;
  } catch (error) {
    console.error("Error creating connection:", error);
    throw error; // Re-throw to allow caller to handle it
  }
};

// Function to start marker selection mode
const handleStartSelectingMarkers = () => {
  console.log("Starting marker selection mode");
  
  // Exit adding marker mode if active
  if (isAddingMarker) {
    setIsAddingMarker(false);
    if (clickListenerRef.current) {
      window.google.maps.event.removeListener(clickListenerRef.current);
      clickListenerRef.current = null;
    }
  }
  
  // Enter marker selection mode - update both state and ref
  isSelectingMarkersRef.current = true;
  setIsSelectingMarkers(true); // Only used for UI updates
  
  // Clear any previously selected markers
  selectedMarkersRef.current = [];
  
  // Update status message
  setStatusMessage({
    type: MessageBarType.info,
    text: 'Select first marker to connect'
  });
  
  console.log("Selection mode activated");
};

// Function to cancel selection mode
const cancelSelectionMode = () => {
  console.log("Canceling selection mode");
  
  // Exit selection mode - update both state and ref
  isSelectingMarkersRef.current = false;
  setIsSelectingMarkers(false); // Only used for UI updates
  
  // Clear selected markers
  selectedMarkersRef.current = [];
  
  // Reset all marker icons
  markersRef.current.forEach(m => {
    m.setIcon(null);
  });
  
  // Clear status message
  setStatusMessage(null);
  
  console.log("Selection mode canceled");
};

// Initialize map when component mounts
useEffect(() => {
  // Function to initialize map
  const initMap = () => {
    console.log("Initializing map...");
    if (!mapRef.current || !window.google || !window.google.maps) {
      console.error("Map reference or Google Maps not available");
      return;
    }
    
    try {
      // Create a new map instance
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 20, lng: 0 },
        zoom: 2,
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: false
      });
      
      // Store map reference
      googleMapRef.current = map;
      
      // Set map as loaded
      setIsMapLoaded(true);
      
      // If we already have provider data, add markers
      if (isDataLoaded && providers.length > 0) {
        addMarkersToMap(providers);
      }
      
      console.log("Map initialized successfully");
    } catch (error) {
      console.error("Error initializing Google Maps:", error);
      setMapError("Failed to initialize Google Maps. Please try again later.");
    }
  };

  // Load Google Maps API
  loadGoogleMapsApi((error) => {
    if (error) {
      setMapError(error.message);
      return;
    }
    initMap();
  });
  
  // Fetch provider data
  fetchProviderData();
  
  // Clean up
  return () => {
    window.initGoogleMaps = null;
    
    // Clean up connections and blink timers
    connections.forEach(connection => {
      // Clear any blinking interval timers
      if (connection.blinkTimerId) {
        clearInterval(connection.blinkTimerId);
      }
      
      // Remove polyline from map
      if (connection.polyline) {
        connection.polyline.setMap(null);
      }
    });
    
    // Remove map click listener if it exists
    if (clickListenerRef.current && window.google && window.google.maps) {
      window.google.maps.event.removeListener(clickListenerRef.current);
    }
    
    // Clear markers
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
  };
}, []); // Empty dependency array means this runs once on mount

// Effect to add markers when both map and data are loaded
useEffect(() => {
  if (isMapLoaded && isDataLoaded && providers.length > 0 && googleMapRef.current) {
    console.log("Map and data loaded, adding markers and connections");
    addMarkersToMap(providers);
    
    // Create connections based on PreviousPoint property
    createInitialConnections(providers);
  }
}, [isMapLoaded, isDataLoaded]);

return (
  <>
    <Header />
    <div className={styles.container}>
      {/* Main content area (90% width) */}
      <div className={styles.mainContent}>
        {mapError ? (
          <MessageBar
            messageBarType={MessageBarType.error}
            isMultiline={false}
            dismissButtonAriaLabel="Close"
          >
            {mapError}
          </MessageBar>
        ) : !isMapLoaded ? (
          <Stack horizontalAlign="center" verticalAlign="center" style={{ height: '100%' }}>
            <Spinner size={SpinnerSize.large} label="Loading Google Maps..." />
          </Stack>
        ) : null}
        
        {/* Status Message */}
        {statusMessage && (
          <div className={styles.statusMessage}>
            <MessageBar
              messageBarType={statusMessage.type}
              isMultiline={false}
              dismissButtonAriaLabel="Close"
              onDismiss={() => setStatusMessage(null)}
            >
              {statusMessage.text}
            </MessageBar>
          </div>
        )}
        
        {/* Map Controls */}
        <MapControls 
          isMapLoaded={isMapLoaded} 
          canConnect={providers.length >= 2}
          isAddingMarker={isAddingMarker}
          isSelectingMarkers={isSelectingMarkers}
          onAddMarker={handleAddMarkerMode}
          onStartConnectMarkers={handleStartSelectingMarkers}
          onCancelSelection={cancelSelectionMode}
        />
        
        {/* Map container div */}
        <div 
          id="mapContainer" 
          ref={mapRef} 
          className={styles.mapContainer}
        />
      </div>

      {/* Side panel (10% width) */}
      <SidePanel 
        providers={providers}
        connections={connections}
      />
    </div>
  </>
);
};

export default ProviderMap;