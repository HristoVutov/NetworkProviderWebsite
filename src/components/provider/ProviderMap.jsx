import React, { useState, useRef, useEffect } from "react";
import { Stack, Spinner, SpinnerSize, MessageBar, MessageBarType } from '@fluentui/react';
import axios from "axios";
import Header from "../common/Header";
import SidePanel from "./SidePanel";
import MapControls from "./MapControls";
import { styles } from "./mapStyles";
import { initialProviders, providerTypes, getPowerGridIcon } from "./mapData";
import { createZigzagPath, loadGoogleMapsApi, createInfoWindow } from "./mapUtils";

const ProviderMap = () => {
  // State variables
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [providers, setProviders] = useState(initialProviders);
  const [connections, setConnections] = useState([]);
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  
  // Refs
  const activeInfoWindowRef = useRef(null);
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const clickListenerRef = useRef(null);

  // Function to add a marker at specific coordinates
  const addMarkerAt = (lat, lng) => {
    if (!googleMapRef.current || !window.google || !window.google.maps) {
      console.error("Google Maps not available");
      return;
    }
    
    // Get random provider type
    const randomType = providerTypes[Math.floor(Math.random() * providerTypes.length)];
    
    // Create new provider
    const newProviderId = providers.length + 1;
    const newProvider = {
      id: newProviderId,
      name: `Provider ${newProviderId}`,
      lat: lat,
      lng: lng,
      type: randomType
    };
    
    // Create marker with icon
    const marker = new window.google.maps.Marker({
      position: { lat: lat, lng: lng },
      map: googleMapRef.current,
      title: newProvider.name,
      animation: window.google.maps.Animation.DROP,
      icon: getPowerGridIcon(randomType)
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
      openInfoWindow(infoWindow, marker);
    });
    
    // Update providers state
    setProviders(prevProviders => [...prevProviders, newProvider]);

    // Send coordinates to API
    sendCoordinatesToAPI(lat, lng);

    return newProvider;
  };
  
  // Function to send coordinates to API
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

  // Function to toggle marker addition mode
  const handleAddMarkerMode = () => {
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

  // Function to connect random markers with zigzag lines
  const handleConnectRandomMarkers = () => {
    if (!googleMapRef.current || providers.length < 2) return;
    
    // Randomly select two different markers
    const availableProviders = [...providers];
    
    // First random provider
    const index1 = Math.floor(Math.random() * availableProviders.length);
    const provider1 = availableProviders[index1];
    availableProviders.splice(index1, 1);
    
    // Second random provider
    const index2 = Math.floor(Math.random() * availableProviders.length);
    const provider2 = availableProviders[index2];
    
    // Create zigzag path
    const path = createZigzagPath(
      { lat: provider1.lat, lng: provider1.lng },
      { lat: provider2.lat, lng: provider2.lng }
    );
    
    // Create polyline
    const connectionId = connections.length + 1;
    const polyline = new window.google.maps.Polyline({
      path: path,
      geodesic: false,
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      map: googleMapRef.current
    });
    
    // Create info window for the connection
    const midpoint = path[Math.floor(path.length / 2)];
    const infoContent = `
      <div style="padding: 8px;">
        <h3 style="margin: 0 0 8px 0;">Connection ${connectionId}</h3>
        <p style="margin: 0;">From: ${provider1.name} (${provider1.type})</p>
        <p style="margin: 0;">To: ${provider2.name} (${provider2.type})</p>
      </div>
    `;
    
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
      polyline: polyline
    };
    
    setConnections(prev => [...prev, newConnection]);
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
        
        // Wait a moment to ensure the map is fully loaded
        setTimeout(() => {
          // Add markers for initial providers
          providers.forEach(provider => {
            // Create marker with custom icon
            const marker = new window.google.maps.Marker({
              position: { lat: provider.lat, lng: provider.lng },
              map: map,
              title: provider.name,
              icon: getPowerGridIcon(provider.type)
            });
            
            // Add info window
            const infoContent = `
              <div style="padding: 8px;">
                <h3 style="margin: 0 0 8px 0;">${provider.name}</h3>
                <p style="margin: 0;">Type: ${provider.type}</p>
              </div>
            `;
            
            const infoWindow = createInfoWindow(infoContent);
            
            marker.addListener('click', () => {
              openInfoWindow(infoWindow, marker);
            });
          });
          
          setIsMapLoaded(true);
          console.log("Map initialized successfully");
        }, 500);
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
    
    // Clean up
    return () => {
      window.initGoogleMaps = null;
      
      // Clean up connections
      connections.forEach(connection => {
        if (connection.polyline) {
          connection.polyline.setMap(null);
        }
      });
      
      // Remove map click listener if it exists
      if (clickListenerRef.current && window.google && window.google.maps) {
        window.google.maps.event.removeListener(clickListenerRef.current);
      }
    };
  }, []); // Empty dependency array means this runs once on mount

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
            onAddMarker={handleAddMarkerMode}
            onConnectMarkers={handleConnectRandomMarkers}
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