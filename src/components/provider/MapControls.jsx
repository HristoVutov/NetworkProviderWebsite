import React from 'react';
import { styles } from './mapStyles';

const MapControls = ({ 
  isMapLoaded, 
  canConnect, 
  isAddingMarker, 
  isSelectingMarkers,
  onAddMarker, 
  onStartConnectMarkers,
  onCancelSelection
}) => {
  console.log("MapControls rendering with isSelectingMarkers:", isSelectingMarkers);
  return (
    <>
      {/* Plus button for adding markers */}
      {isMapLoaded && (
        <div 
          className={`${styles.addButton} ${isAddingMarker ? styles.addButtonActive : ''}`} 
          onClick={onAddMarker}
          title={isAddingMarker ? "Cancel adding marker" : "Add Marker"}
        >
          {isAddingMarker ? '✕' : '+'}
        </div>
      )}
      
      {/* Connect button for selecting and connecting markers */}
      {isMapLoaded && canConnect && (
        <div 
          className={`${styles.connectButton} ${isSelectingMarkers ? styles.connectButtonActive : ''}`} 
          onClick={() => {
            console.log("Connect button clicked, isSelectingMarkers:", isSelectingMarkers);
            if (isSelectingMarkers) {
              onCancelSelection();
            } else {
              onStartConnectMarkers();
            }
          }}
          title={isSelectingMarkers ? "Cancel marker selection" : "Connect Markers"}
        >
          {isSelectingMarkers ? '✕' : '⚡'}
        </div>
      )}
    </>
  );
};

export default MapControls;