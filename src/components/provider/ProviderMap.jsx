import React, { useState, useRef, useEffect } from "react";
import { Stack, Spinner, SpinnerSize, MessageBar, MessageBarType } from '@fluentui/react';
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
  
  // Refs
  const activeInfoWindowRef = useRef(null);
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);

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

  // Function to add a random marker
  const handleAddRandomMarker = () => {
    if (!googleMapRef.current || !window.google || !window.google.maps) {
      console.error("Map reference or Google Maps not available");
      return;
    }
    
    try {
      // Generate random coordinates within the visible map bounds
      const bounds = googleMapRef.current.getBounds();
      if (!bounds) {
        console.warn("Map bounds not available, using default view");
        // Use default coordinates if bounds not available
        const center = googleMapRef.current.getCenter();
        const lat = center.lat() + (Math.random() - 0.5) * 10;
        const lng = center.lng() + (Math.random() - 0.5) * 10;
        addMarkerAt(lat, lng);
        return;
      }
      
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      
      // Generate random lat/lng within the visible bounds
      const lat = sw.lat() + (ne.lat() - sw.lat()) * Math.random();
      const lng = sw.lng() + (ne.lng() - sw.lng()) * Math.random();
      
      addMarkerAt(lat, lng);
    } catch (error) {
      console.error("Error adding random marker:", error);
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
          
          {/* Map Controls */}
          <MapControls 
            isMapLoaded={isMapLoaded} 
            canConnect={providers.length >= 2}
            onAddMarker={handleAddRandomMarker}
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