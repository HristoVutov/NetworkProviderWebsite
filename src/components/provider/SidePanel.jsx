import React from 'react';
import { Stack, Text, FontIcon } from '@fluentui/react';
import { styles } from './mapStyles';

const SidePanel = ({ providers, connections }) => {
  // Count providers by status
  const runningCount = providers.filter(p => p.status === "Running").length;
  const stoppedCount = providers.filter(p => p.status === "Stopped").length;
  const unknownCount = providers.filter(p => !p.status).length;
  
  return (
    <div className={styles.sidePanel}>
      <Stack className={styles.panelContent}>
        <Text variant="large" className={styles.title}>Providers</Text>
        <Text>Total Providers: {providers.length}</Text>
        <Text>Connections: {connections.length}</Text>
        
        {/* Status counts */}
        <Stack style={{ marginTop: '10px' }}>
          {runningCount > 0 && (
            <Stack horizontal verticalAlign="center" style={{ marginBottom: '4px' }}>
              <FontIcon 
                iconName="CircleFill" 
                style={{ color: 'green', fontSize: '12px', marginRight: '8px' }} 
              />
              <Text>Running: {runningCount}</Text>
            </Stack>
          )}
          
          {stoppedCount > 0 && (
            <Stack horizontal verticalAlign="center" style={{ marginBottom: '4px' }}>
              <FontIcon 
                iconName="CircleFill" 
                style={{ color: 'red', fontSize: '12px', marginRight: '8px' }} 
              />
              <Text>Stopped: {stoppedCount}</Text>
            </Stack>
          )}
          
          {unknownCount > 0 && (
            <Stack horizontal verticalAlign="center" style={{ marginBottom: '4px' }}>
              <FontIcon 
                iconName="CircleFill" 
                style={{ color: 'gray', fontSize: '12px', marginRight: '8px' }} 
              />
              <Text>Unknown: {unknownCount}</Text>
            </Stack>
          )}
        </Stack>
        
        {/* Provider list */}
        <Stack style={{ marginTop: '20px', maxHeight: '300px', overflowY: 'auto' }}>
          <Text variant="medium" style={{ fontWeight: 'semibold' }}>Provider List:</Text>
          {providers.map(provider => (
            <Stack key={provider.id} horizontal verticalAlign="center" style={{ marginTop: '8px' }}>
              <FontIcon 
                iconName="CircleFill" 
                style={{ 
                  color: provider.status === "Running" ? 'green' : 
                         provider.status === "Stopped" ? 'red' : 'gray', 
                  fontSize: '10px', 
                  marginRight: '8px' 
                }} 
              />
              <Text>
                {provider.name} ({provider.type})
                {provider.status ? ` - ${provider.status}` : ''}
              </Text>
            </Stack>
          ))}
        </Stack>
        
        {/* Connection list */}
        {connections.length > 0 && (
          <Stack style={{ marginTop: '20px', maxHeight: '300px', overflowY: 'auto' }}>
            <Text variant="medium" style={{ fontWeight: 'semibold' }}>Connection List:</Text>
            {connections.map(connection => {
              const fromProvider = providers.find(p => p.id === connection.from);
              const toProvider = providers.find(p => p.id === connection.to);
              const bothStopped = fromProvider?.status === "Stopped" && toProvider?.status === "Stopped";
              
              return (
                <Stack key={connection.id} horizontal verticalAlign="center" style={{ marginTop: '8px' }}>
                  <div style={{ 
                    width: '12px', 
                    height: '3px', 
                    backgroundColor: bothStopped ? 'red' : 'green',
                    marginRight: '8px'
                  }} />
                  <Text>
                    {fromProvider?.name} → {toProvider?.name}
                  </Text>
                </Stack>
              );
            })}
          </Stack>
        )}
      </Stack>
    </div>
  );
};

export default SidePanel;