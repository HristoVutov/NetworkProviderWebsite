import React from 'react';
import { styles } from './mapStyles';

const MapControls = ({ isMapLoaded, canConnect, onAddMarker, onConnectMarkers }) => {
  return (
    <>
      {/* Plus button for adding random markers */}
      {isMapLoaded && (
        <div 
          className={styles.addButton} 
          onClick={onAddMarker}
          title="Add Random Marker"
        >
          +
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