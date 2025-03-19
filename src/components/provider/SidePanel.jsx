import React from 'react';
import { Stack, Text } from '@fluentui/react';
import { styles } from './mapStyles';

const SidePanel = ({ providers, connections }) => {
  return (
    <div className={styles.sidePanel}>
      <Stack className={styles.panelContent}>
        <Text variant="large" className={styles.title}>Providers</Text>
        <Text>Total Providers: {providers.length}</Text>
        <Text>Connections: {connections.length}</Text>
        
        {/* Provider list */}
        <Stack style={{ marginTop: '20px', maxHeight: '300px', overflowY: 'auto' }}>
          <Text variant="medium" style={{ fontWeight: 'semibold' }}>Provider List:</Text>
          {providers.map(provider => (
            <Text key={provider.id} style={{ marginTop: '8px' }}>
              {provider.name} ({provider.type})
            </Text>
          ))}
        </Stack>
        
        {/* Connection list */}
        {connections.length > 0 && (
          <Stack style={{ marginTop: '20px', maxHeight: '300px', overflowY: 'auto' }}>
            <Text variant="medium" style={{ fontWeight: 'semibold' }}>Connection List:</Text>
            {connections.map(connection => {
              const fromProvider = providers.find(p => p.id === connection.from);
              const toProvider = providers.find(p => p.id === connection.to);
              return (
                <Text key={connection.id} style={{ marginTop: '8px' }}>
                  {fromProvider?.name} → {toProvider?.name}
                </Text>
              );
            })}
          </Stack>
        )}
      </Stack>
    </div>
  );
};

export default SidePanel;