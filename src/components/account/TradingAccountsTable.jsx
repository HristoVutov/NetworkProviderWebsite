import React, { useState } from "react";
import { 
  DetailsList, 
  SelectionMode, 
  DetailsListLayoutMode,
  Text,
  Stack,
  mergeStyleSets,
  IconButton,
  Selection
} from '@fluentui/react';
import { useHistory } from 'react-router-dom';

// Styles for the component
const styles = mergeStyleSets({
  container: {
    margin: '20px 0',
  },
  header: {
    margin: '0 0 20px 0',
  },
  row: {
    cursor: 'pointer',
  }
});

// Component for displaying trading accounts in a table
const TradingAccountsTable = ({ accounts, onAccountSelected }) => {
  const history = useHistory();
  const [selectedItems, setSelectedItems] = useState([]);

  if (!accounts || accounts.length === 0) {
    return (
      <Stack className={styles.container}>
        <Text variant="xLarge" className={styles.header}>Trading Accounts</Text>
        <Text>No trading accounts found.</Text>
      </Stack>
    );
  }

  // Initialize selection object
  const selection = new Selection({
    onSelectionChanged: () => {
      const selectedItems = selection.getSelection();
      setSelectedItems(selectedItems);
      
      // Call the parent's onAccountSelected if provided and if there's a selection
      if (onAccountSelected && selectedItems.length > 0) {
        onAccountSelected(selectedItems[0]);
      }
    },
  });

  // Define columns for DetailsList
  const columns = [
    {
      key: 'name',
      name: 'Name',
      fieldName: 'Name',
      minWidth: 100,
      maxWidth: 200,
      isResizable: true,
    },
    {
      key: 'strategies',
      name: 'Strategies',
      fieldName: 'Strategies',
      minWidth: 200,
      maxWidth: 500,
      isResizable: true,
      onRender: (item) => {
        if (!item.Strategies || item.Strategies.length === 0) {
          return <span>No strategies</span>;
        }
        
        return (
          <span>
            {item.Strategies.map((strategy, index) => {
              // Handle different strategy data formats
              const strategyName = strategy.Name || 
                (typeof strategy === 'object' && strategy.$oid ? strategy.$oid : strategy);
              return (
                <span key={index}>
                  {strategyName}
                  {index < item.Strategies.length - 1 ? ', ' : ''}
                </span>
              );
            })}
          </span>
        );
      }
    },
    {
      key: 'trades',
      name: 'Trades',
      minWidth: 70,
      maxWidth: 100,
      isResizable: false,
      onRender: (item) => (
        <IconButton
          iconProps={{ iconName: 'AllCurrency' }}
          title="View Trades"
          ariaLabel="View Trades"
          onClick={(e) => {
            // Stop propagation to prevent row selection when clicking the button
            e.stopPropagation();
            history.push(`/trades/tradingAccount/${item._id}`);
          }}
          styles={{ root: { color: '#0078d4' } }}
        />
      )
    }
  ];

  return (
    <Stack className={styles.container}>
      <Text variant="xLarge" className={styles.header}>Trading Accounts</Text>
      <DetailsList
        items={accounts}
        columns={columns}
        selectionMode={SelectionMode.single}
        selection={selection}
        layoutMode={DetailsListLayoutMode.justified}
        isHeaderVisible={true}
        onItemInvoked={(item) => {
          if (onAccountSelected) {
            onAccountSelected(item);
          }
        }}
        styles={{ root: { selectors: { '.ms-DetailsRow': styles.row }}}}
      />
    </Stack>
  );
};

export default TradingAccountsTable;