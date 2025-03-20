import React from 'react';
import { styles } from './mapStyles';

const MapControls = ({ isMapLoaded, canConnect, isAddingMarker, onAddMarker, onConnectMarkers }) => {
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
      
      {/* Connect button for adding zigzag connections */}
      {isMapLoaded && canConnect && (
        <div 
          className={styles.connectButton} 
          onClick={onConnectMarkers}
          title="Connect Random Markers"
        >
          ⚡
        </div>
      )}
    </>
  );
};

export default MapControls;