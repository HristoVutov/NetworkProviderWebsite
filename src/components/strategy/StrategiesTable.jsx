import React from "react";
import { 
  DetailsList, 
  SelectionMode, 
  DetailsListLayoutMode,
  Text,
  Stack,
  mergeStyleSets
} from '@fluentui/react';

// Styles for the component
const styles = mergeStyleSets({
  container: {
    margin: '20px 0',
  },
  header: {
    margin: '0 0 20px 0',
  }
});

// Component for displaying strategies in a table
const StrategiesTable = ({ strategies }) => {
  if (!strategies || strategies.length === 0) {
    return (
      <Stack className={styles.container}>
        <Text variant="xLarge" className={styles.header}>Strategies</Text>
        <Text>No strategies found.</Text>
      </Stack>
    );
  }

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
      key: 'url',
      name: 'URL',
      fieldName: 'Url',
      minWidth: 150,
      maxWidth: 300,
      isResizable: true,
    },
    {
      key: 'parameters',
      name: 'Parameters',
      fieldName: 'Parameters',
      minWidth: 150,
      maxWidth: 300,
      isResizable: true,
    },
    {
      key: 'skipChecks',
      name: 'Skip Checks',
      fieldName: 'SkipChecksTakeTrade',
      minWidth: 100,
      maxWidth: 120,
      isResizable: true,
      onRender: (item) => (
        <span>{item.SkipChecksTakeTrade ? "Yes" : "No"}</span>
      )
    },
    {
      key: 'createdAt',
      name: 'Created At',
      minWidth: 100,
      maxWidth: 150,
      isResizable: true,
      onRender: (item) => {
        const createdAt = item.createdAt && item.createdAt.$date
          ? new Date(parseInt(item.createdAt.$date.$numberLong)).toLocaleDateString()
          : "N/A";
        return <span>{createdAt}</span>;
      }
    }
  ];

  return (
    <Stack className={styles.container}>
      <Text variant="xLarge" className={styles.header}>Strategies</Text>
      <DetailsList
        items={strategies}
        columns={columns}
        selectionMode={SelectionMode.none}
        layoutMode={DetailsListLayoutMode.justified}
        isHeaderVisible={true}
        getKey={(item) => item._id.$oid || item._id}
      />
    </Stack>
  );
};

export default StrategiesTable;