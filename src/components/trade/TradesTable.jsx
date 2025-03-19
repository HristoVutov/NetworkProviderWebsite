import React from "react";
import { useHistory } from "react-router-dom";
import { 
  DetailsList, 
  SelectionMode, 
  DetailsListLayoutMode,
  Text,
  Stack,
  mergeStyleSets,
  DetailsRow,
  IconButton
} from '@fluentui/react';

// Styles for the component
const styles = mergeStyleSets({
  container: {
    margin: '20px 0',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  header: {
    margin: '0 0 20px 0',
  },
  positive: {
    color: 'green',
    fontWeight: 'bold',
  },
  negative: {
    color: 'red',
    fontWeight: 'bold',
  },
  pending: {
    color: 'orange',
  },
  paginationContainer: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationInfo: {
    margin: '0 10px',
    fontSize: '14px',
  },
  pageButton: {
    minWidth: '32px',
    height: '32px',
    padding: '0',
    margin: '0 2px',
  }
});

// Format date to a readable format
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString();
};

// Component for displaying trades in a table
const TradesTable = ({ trades, pagination, onPageChange }) => {
  const history = useHistory();
  
  if (!trades || trades.length === 0) {
    return (
      <Stack className={styles.container}>
        <Text variant="xLarge" className={styles.header}>Trades</Text>
        <Text>No trades found for this account.</Text>
      </Stack>
    );
  }

  // Custom row rendering to add conditional formatting
  const onRenderRow = (props) => {
    const customStyles = {};
    
    if (props.item.Status === 'completed') {
      if (props.item.Outcome === 'win' || props.item.Profitloss > 0) {
        customStyles.root = { backgroundColor: '#e6ffe6' }; // Light green for winning trades
      } else if (props.item.Outcome === 'loss' || props.item.Profitloss < 0) {
        customStyles.root = { backgroundColor: '#fff0f0' }; // Light red for losing trades
      }
    }
    
    return <DetailsRow {...props} styles={customStyles} />;
  };

  // Define columns for DetailsList
  const columns = [
    {
      key: 'pair',
      name: 'Pair',
      fieldName: 'Pair',
      minWidth: 80,
      maxWidth: 100,
      isResizable: true,
    },
    {
      key: 'entry',
      name: 'Entry',
      fieldName: 'Entry',
      minWidth: 80,
      maxWidth: 100,
      isResizable: true,
      onRender: (item) => (
        <span>{Number(item.Entry).toFixed(5)}</span>
      )
    },
    {
      key: 'stopLoss',
      name: 'Stop Loss',
      fieldName: 'StopLoss',
      minWidth: 80,
      maxWidth: 100,
      isResizable: true,
      onRender: (item) => (
        <span>{Number(item.StopLoss).toFixed(5)}</span>
      )
    },
    {
      key: 'target',
      name: 'Target',
      fieldName: 'Target',
      minWidth: 80,
      maxWidth: 100,
      isResizable: true,
      onRender: (item) => (
        <span>{Number(item.Target).toFixed(5)}</span>
      )
    },
    {
      key: 'riskReward',
      name: 'Risk/Reward',
      fieldName: 'RiskReward',
      minWidth: 80,
      maxWidth: 100,
      isResizable: true,
      onRender: (item) => (
        <span>{Number(item.RiskReward).toFixed(2)}</span>
      )
    },
    {
      key: 'status',
      name: 'Status',
      fieldName: 'Status',
      minWidth: 80,
      maxWidth: 100,
      isResizable: true,
      onRender: (item) => (
        <span className={item.Status === 'pending' ? styles.pending : ''}>
          {item.Status.charAt(0).toUpperCase() + item.Status.slice(1)}
        </span>
      )
    },
    {
      key: 'outcome',
      name: 'Outcome',
      fieldName: 'Outcome',
      minWidth: 80,
      maxWidth: 100,
      isResizable: true,
      onRender: (item) => {
        if (item.Outcome === 'win') {
          return <span className={styles.positive}>Win</span>;
        } else if (item.Outcome === 'loss') {
          return <span className={styles.negative}>Loss</span>;
        } else {
          return <span className={styles.pending}>{item.Outcome.charAt(0).toUpperCase() + item.Outcome.slice(1)}</span>;
        }
      }
    },
    {
      key: 'profitLoss',
      name: 'Profit/Loss',
      fieldName: 'Profitloss',
      minWidth: 80,
      maxWidth: 100,
      isResizable: true,
      onRender: (item) => {
        const value = Number(item.Profitloss);
        const formattedValue = value.toFixed(2);
        if (value > 0) {
          return <span className={styles.positive}>+{formattedValue}</span>;
        } else if (value < 0) {
          return <span className={styles.negative}>{formattedValue}</span>;
        } else {
          return <span>{formattedValue}</span>;
        }
      }
    },
    {
      key: 'entryTime',
      name: 'Entry Time',
      fieldName: 'EntryTime',
      minWidth: 150,
      maxWidth: 200,
      isResizable: true,
      onRender: (item) => <span>{formatDate(item.EntryTime)}</span>
    },
    {
      key: 'chart',
      name: 'Chart',
      minWidth: 50,
      maxWidth: 70,
      isResizable: false,
      onRender: (item) => (
        <IconButton
          iconProps={{ iconName: 'BarChartVertical' }}
          title="View Chart"
          ariaLabel="View Chart"
          onClick={() => history.push(`/trades/${item._id}/chart`)}
          styles={{ root: { color: '#0078d4' } }}
        />
      )
    }
  ];

  // Render pagination controls
  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) {
      return null;
    }

    const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination;

    return (
      <div className={styles.paginationContainer}>
        <IconButton
          iconProps={{ iconName: 'ChevronLeft' }}
          title="Previous Page"
          ariaLabel="Previous Page"
          disabled={!hasPrevPage}
          onClick={() => onPageChange(currentPage - 1)}
          className={styles.pageButton}
        />

        <span className={styles.paginationInfo}>
          Page {currentPage} of {totalPages} ({pagination.total} total trades)
        </span>

        <IconButton
          iconProps={{ iconName: 'ChevronRight' }}
          title="Next Page"
          ariaLabel="Next Page"
          disabled={!hasNextPage}
          onClick={() => onPageChange(currentPage + 1)}
          className={styles.pageButton}
        />
      </div>
    );
  };

  return (
    <Stack className={styles.container}>
      <Text variant="xLarge" className={styles.header}>
        Trades
      </Text>
      <DetailsList
        items={trades}
        columns={columns}
        selectionMode={SelectionMode.none}
        layoutMode={DetailsListLayoutMode.justified}
        isHeaderVisible={true}
        onRenderRow={onRenderRow}
      />
      
      {renderPagination()}
    </Stack>
  );
};

export default TradesTable;