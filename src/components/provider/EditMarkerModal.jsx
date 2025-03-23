import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  IconButton,
  TextField,
  PrimaryButton,
  DefaultButton,
  Stack,
  StackItem,
  Text,
  Dropdown,
  mergeStyleSets,
  getTheme,
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize
} from '@fluentui/react';
import axios from "axios";
import { mapInitRegistry } from "./mapUtils";

const theme = getTheme();

// Styles for the component
const styles = mergeStyleSets({
  modal: {
    width: '70%',
    maxWidth: '1000px',
    minHeight: '500px',
  },
  header: {
    padding: '20px 20px 10px 20px',
    borderBottom: `1px solid ${theme.palette.neutralLight}`,
  },
  body: {
    padding: '20px',
    overflowY: 'auto',
    maxHeight: 'calc(80vh - 160px)',
  },
  footer: {
    padding: '15px 20px 20px 20px',
    borderTop: `1px solid ${theme.palette.neutralLight}`,
  },
  mapContainer: {
    height: '300px',
    marginBottom: '20px',
    border: `1px solid ${theme.palette.neutralLight}`,
    borderRadius: '2px',
    position: 'relative',
  },
  geolocateButton: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    zIndex: 1000,
    backgroundColor: 'white',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    borderRadius: '2px',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: 'none',
  },
  geolocateButtonIcon: {
    fontSize: '14px',
    marginRight: '5px',
  }
});

// Provider status options
const statusOptions = [
  { key: 'Running', text: 'Running' },
  { key: 'Stopped', text: 'Stopped' },
];

const EditMarkerModal = ({ isOpen, onDismiss, provider, onUpdate }) => {
  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    zone: '',
    phone1: '',
    phone2: '',
    ip: '',
    status: '',
    lat: 0,
    lng: 0,
  });

  // State for loading and error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);

  // References
  const mapRef = useRef(null);
  const modalMapRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);

  // Initialize form data when provider changes
  useEffect(() => {
    if (provider) {
      setFormData({
        name: provider.name || '',
        address: provider.address || '',
        zone: provider.zone || '',
        phone1: provider.phone1 || '',
        phone2: provider.phone2 || '',
        ip: provider.ip || '',
        status: provider.status || '',
        lat: provider.lat || 0,
        lng: provider.lng || 0,
      });
    }
  }, [provider]);

  // Initialize map after modal is open
  useEffect(() => {
    if (isOpen && provider && mapRef.current) {
      // Register map initialization function to our registry
      const initModalMapFunction = () => {
        if (!mapRef.current || !window.google || !window.google.maps) return;
        
        // If map is already initialized, clean it up
        if (modalMapRef.current) {
          if (markerRef.current) {
            markerRef.current.setMap(null);
          }
        }
        
        // Create map instance
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: formData.lat, lng: formData.lng },
          zoom: 14,
          mapTypeControl: false,
          streetViewControl: false
        });

        map.setCenter(42.659934, 24.056087)
        // Store reference to map
        modalMapRef.current = map;

        // Create marker for the provider
        const marker = new window.google.maps.Marker({
          position: { lat: formData.lat, lng: formData.lng },
          map: map,
          draggable: true,
          title: formData.name
        });

        // Store reference to marker
        markerRef.current = marker;
        
        // Create geocoder instance
        geocoderRef.current = new window.google.maps.Geocoder();

        // Add event listener for marker drag end
        marker.addListener('dragend', function() {
          const position = marker.getPosition();
          setFormData(prev => ({
            ...prev,
            lat: position.lat(),
            lng: position.lng()
          }));
        });

        // Add event listener for map click
        map.addListener('click', function(e) {
          const latLng = e.latLng;
          marker.setPosition(latLng);
          setFormData(prev => ({
            ...prev,
            lat: latLng.lat(),
            lng: latLng.lng()
          }));
        });
      };
      
      // Register the function with our registry
      mapInitRegistry.register(initModalMapFunction);
    }
    
    return () => {
      // Clean up map and marker when component unmounts
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      modalMapRef.current = null;
      geocoderRef.current = null;
    };
  }, [isOpen, provider, formData.lat, formData.lng, formData.name]);
  
  // Function to geocode the address
  const geocodeAddress = () => {
    // Check if address is empty
    if (!formData.address.trim()) {
      setError("Please enter an address to geolocate");
      return;
    }
    
    // Check if geocoder is available
    if (!geocoderRef.current || !window.google || !window.google.maps) {
      setError("Geocoding service is not available");
      return;
    }
    
    // Clear any existing errors
    setError(null);
    setIsGeocodingLoading(true);
    
    // Call geocoder with address
    geocoderRef.current.geocode(
      { address: formData.address },
      (results, status) => {
        setIsGeocodingLoading(false);
        
        if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
          // Get location from first result
          const location = results[0].geometry.location;
          
          // Update form data with new coordinates
          setFormData(prev => ({
            ...prev,
            lat: location.lat(),
            lng: location.lng()
          }));
          
          // Update marker position
          if (markerRef.current && modalMapRef.current) {
            const newPosition = new window.google.maps.LatLng(location.lat(), location.lng());
            markerRef.current.setPosition(newPosition);
            modalMapRef.current.setCenter(newPosition);
            modalMapRef.current.setZoom(15); // Zoom in for better view
          }
          
          // Show success message
          setSuccess(`Address geocoded successfully: ${results[0].formatted_address}`);
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            setSuccess(null);
          }, 3000);
        } else {
          // Handle geocoding error
          let errorMessage = "Could not find coordinates for this address";
          
          switch(status) {
            case window.google.maps.GeocoderStatus.ZERO_RESULTS:
              errorMessage = "No results found for this address";
              break;
            case window.google.maps.GeocoderStatus.OVER_QUERY_LIMIT:
              errorMessage = "Too many requests, please try again later";
              break;
            case window.google.maps.GeocoderStatus.REQUEST_DENIED:
              errorMessage = "Geocoding service request was denied";
              break;
            case window.google.maps.GeocoderStatus.INVALID_REQUEST:
              errorMessage = "Invalid geocoding request";
              break;
            default:
              errorMessage = `Geocoding error: ${status}`;
          }
          
          setError(errorMessage);
        }
      }
    );
  };

  // Handle form input changes
  const handleInputChange = (e, newValue, fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: newValue
    }));
  };

  // Handle dropdown changes
  const handleDropdownChange = (e, option, fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: option.key
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form data
    if (!formData.name.trim()) {
      setError("Provider name is required");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Get auth token from cookie
      const authToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

      if (!authToken) {
        setError("You must be logged in to update markers");
        setIsLoading(false);
        return;
      }

      // Prepare data for API request
      const updateData = {
        name: formData.name,
        address: formData.address,
        zone: formData.zone,
        phone1: formData.phone1,
        phone2: formData.phone2,
        ip: formData.ip,
        lat: formData.lat.toString(),
        lng: formData.lng.toString()
      };

      // Send update request to API
      const response = await axios.put(
        `http://localhost:3001/api/point/${provider.id}`,
        updateData,
        {
          headers: {
            'auth-token': authToken
          }
        }
      );

      // Show success message
      setSuccess("Provider updated successfully");
      
      // Call the onUpdate callback to update parent component
      if (onUpdate) {
        // Create updated provider object
        const updatedProvider = {
          ...provider,
          name: formData.name,
          address: formData.address,
          zone: formData.zone,
          phone1: formData.phone1,
          phone2: formData.phone2,
          ip: formData.ip,
          status: formData.status,
          lat: formData.lat,
          lng: formData.lng
        };
        
        onUpdate(updatedProvider);
      }

      // Close modal after a short delay
      setTimeout(() => {
        onDismiss();
      }, 1500);
      
    } catch (error) {
      console.error("Error updating provider:", error);
      setError(error.response?.data?.message || "Failed to update provider. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onDismiss={onDismiss}
      isBlocking={true}
      containerClassName={styles.modal}
    >
      <div className={styles.header}>
        <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
          <Text variant="xLarge">Edit Provider</Text>
          <IconButton
            iconProps={{ iconName: 'Cancel' }}
            ariaLabel="Close popup modal"
            onClick={onDismiss}
          />
        </Stack>
      </div>
      
      <div className={styles.body}>
        <Stack tokens={{ childrenGap: 15 }}>
          {/* Map Container */}
          <div className={styles.mapContainer}>
            {/* Geolocate Button */}
            <button 
              className={styles.geolocateButton}
              onClick={geocodeAddress}
              disabled={isGeocodingLoading || !formData.address}
              title="Find coordinates from address"
              type="button"
            >
              {isGeocodingLoading ? (
                <Spinner size={SpinnerSize.small} />
              ) : (
                <>
                  <i className={`${styles.geolocateButtonIcon} ms-Icon ms-Icon--MapPin`} aria-hidden="true"></i>
                  Geolocate
                </>
              )}
            </button>
            <div ref={mapRef} style={{ height: '100%', width: '100%' }}></div>
          </div>
          
          {/* Coordinates Display */}
          <Stack horizontal tokens={{ childrenGap: 10 }}>
            <Stack.Item grow={1}>
              <TextField
                label="Latitude"
                value={formData.lat.toString()}
                onChange={(e, newValue) => handleInputChange(e, parseFloat(newValue), 'lat')}
                disabled={isLoading}
              />
            </Stack.Item>
            <Stack.Item grow={1}>
              <TextField
                label="Longitude"
                value={formData.lng.toString()}
                onChange={(e, newValue) => handleInputChange(e, parseFloat(newValue), 'lng')}
                disabled={isLoading}
              />
            </Stack.Item>
          </Stack>
          
          {/* Provider Information */}
          <TextField
            label="Provider Name"
            value={formData.name}
            onChange={(e, newValue) => handleInputChange(e, newValue, 'name')}
            required
            disabled={isLoading}
          />
          
          <TextField
            label="Address"
            value={formData.address}
            onChange={(e, newValue) => handleInputChange(e, newValue, 'address')}
            disabled={isLoading}
            description="Enter an address and use the 'Geolocate' button on the map to find coordinates"
          />
          
          <TextField
            label="Zone"
            value={formData.zone}
            onChange={(e, newValue) => handleInputChange(e, newValue, 'zone')}
            disabled={isLoading}
          />
          
          <Stack horizontal tokens={{ childrenGap: 10 }}>
            <Stack.Item grow={1}>
              <TextField
                label="Phone 1"
                value={formData.phone1}
                onChange={(e, newValue) => handleInputChange(e, newValue, 'phone1')}
                disabled={isLoading}
              />
            </Stack.Item>
            <Stack.Item grow={1}>
              <TextField
                label="Phone 2"
                value={formData.phone2}
                onChange={(e, newValue) => handleInputChange(e, newValue, 'phone2')}
                disabled={isLoading}
              />
            </Stack.Item>
          </Stack>
          
          <TextField
            label="IP"
            value={formData.ip}
            onChange={(e, newValue) => handleInputChange(e, newValue, 'ip')}
            disabled={isLoading}
          />
          
          <Dropdown
            label="Status"
            selectedKey={formData.status}
            options={statusOptions}
            onChange={(e, option) => handleDropdownChange(e, option, 'status')}
            disabled={isLoading}
          />
          
          {/* Error and Success Messages */}
          {error && (
            <MessageBar
              messageBarType={MessageBarType.error}
              isMultiline={false}
              onDismiss={() => setError(null)}
              dismissButtonAriaLabel="Close"
            >
              {error}
            </MessageBar>
          )}
          
          {success && (
            <MessageBar
              messageBarType={MessageBarType.success}
              isMultiline={false}
              onDismiss={() => setSuccess(null)}
              dismissButtonAriaLabel="Close"
            >
              {success}
            </MessageBar>
          )}
        </Stack>
      </div>
      
      <div className={styles.footer}>
        <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: 10 }}>
          <DefaultButton
            text="Cancel"
            onClick={onDismiss}
            disabled={isLoading}
          />
          <PrimaryButton
            text={isLoading ? "Saving..." : "Save Changes"}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading && <Spinner size={SpinnerSize.small} style={{ marginLeft: '8px' }} />}
          </PrimaryButton>
        </Stack>
      </div>
    </Modal>
  );
};

export default EditMarkerModal;