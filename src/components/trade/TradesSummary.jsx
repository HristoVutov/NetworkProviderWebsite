import React, { useMemo } from "react";
import {
  Stack,
  Text,
  mergeStyleSets,
  FontIcon,
  StackItem
} from '@fluentui/react';

// Styles for the component
const styles = mergeStyleSets({
  container: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  header: {
    marginBottom: '16px',
  },
  cardsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
  },
  card: {
    width: '220px',
    padding: '16px',
    textAlign: 'center',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    borderRadius: '2px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  positive: {
    color: 'green',
  },
  negative: {
    color: 'red',
  },
  neutral: {
    color: '#0078d4',
  },
  icon: {
    fontSize: '24px',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '8px 0',
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
  },
  paginationNote: {
    fontSize: '14px',
    color: '#666',
    marginTop: '5px',
  }
});

const TradesSummary = ({ trades, account, pagination }) => {
  // Calculate summary statistics
  const summary = useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        totalTrades: 0,
        completedTrades: 0,
        pendingTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalProfit: 0,
        averageProfitPerTrade: 0,
      };
    }
    trades = trades.filter(trade => trade != null)
    const completedTrades = trades.filter(trade => trade.Status === 'completed');
    const pendingTrades = trades.filter(trade => trade.Status === 'pending' || trade.Status === 'open');
    const winningTrades = completedTrades.filter(trade => 
      trade.Outcome === 'win' || trade.Profitloss > 0
    );
    const losingTrades = completedTrades.filter(trade => 
      trade.Outcome === 'loss' || trade.Profitloss < 0
    );
    
    const totalProfit = trades.reduce((sum, trade) => sum + Number(trade.Profitloss || 0), 0);
    const winRate = completedTrades.length > 0 
      ? (winningTrades.length / completedTrades.length * 100).toFixed(1) 
      : 0;
    const averageProfitPerTrade = completedTrades.length > 0 
      ? (totalProfit / completedTrades.length).toFixed(2) 
      : 0;

    return {
      totalTrades: pagination ? pagination.total : trades.length,
      displayedTrades: trades.length,
      completedTrades: completedTrades.length,
      pendingTrades: pendingTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate,
      totalProfit,
      averageProfitPerTrade,
    };
  }, [trades, pagination]);

  return (
    <Stack className={styles.container}>
      <Stack.Item className={styles.header}>
        <Text variant="xLarge">
          {account ? `Trading Summary for ${account.Name}` : 'Trading Summary'}
        </Text>
        {pagination && pagination.totalPages > 1 && (
          <Text className={styles.paginationNote}>
            Showing page {pagination.currentPage} of {pagination.totalPages} ({summary.displayedTrades} out of {pagination.total} trades)
          </Text>
        )}
      </Stack.Item>
      
      <Stack horizontal wrap tokens={{ childrenGap: 16 }} className={styles.cardsContainer}>
        <Stack className={styles.card}>
          <FontIcon iconName="BarChartVertical" className={`${styles.icon} ${styles.neutral}`} />
          <Text className={styles.statValue}>{summary.totalTrades}</Text>
          <Text className={styles.statLabel}>Total Trades</Text>
        </Stack>
        
        <Stack className={styles.card}>
          <FontIcon iconName="CompletedSolid" className={`${styles.icon} ${styles.neutral}`} />
          <Text className={styles.statValue}>{summary.completedTrades}</Text>
          <Text className={styles.statLabel}>Completed Trades</Text>
        </Stack>
        
        <Stack className={styles.card}>
          <FontIcon iconName="Clock" className={`${styles.icon} ${styles.neutral}`} />
          <Text className={styles.statValue}>{summary.pendingTrades}</Text>
          <Text className={styles.statLabel}>Pending Trades</Text>
        </Stack>
        
        <Stack className={styles.card}>
          <FontIcon 
            iconName="Trophy2Solid" 
            className={`${styles.icon} ${Number(summary.winRate) > 50 ? styles.positive : styles.neutral}`} 
          />
          <Text 
            className={styles.statValue}
            style={{ color: Number(summary.winRate) > 50 ? 'green' : (Number(summary.winRate) < 40 ? 'red' : 'inherit') }}
          >
            {summary.winRate}%
          </Text>
          <Text className={styles.statLabel}>Win Rate</Text>
        </Stack>
        
        <Stack className={styles.card}>
          <FontIcon 
            iconName="Up" 
            className={`${styles.icon} ${styles.positive}`} 
          />
          <Text className={styles.statValue}>{summary.winningTrades}</Text>
          <Text className={styles.statLabel}>Winning Trades</Text>
        </Stack>
        
        <Stack className={styles.card}>
          <FontIcon 
            iconName="Down" 
            className={`${styles.icon} ${styles.negative}`} 
          />
          <Text className={styles.statValue}>{summary.losingTrades}</Text>
          <Text className={styles.statLabel}>Losing Trades</Text>
        </Stack>
        
        <Stack className={styles.card}>
          <FontIcon 
            iconName="Money" 
            className={`${styles.icon} ${summary.totalProfit >= 0 ? styles.positive : styles.negative}`} 
          />
          <Text 
            className={styles.statValue}
            style={{ color: summary.totalProfit >= 0 ? 'green' : 'red' }}
          >
            {summary.totalProfit >= 0 ? '+' : ''}{Number(summary.totalProfit).toFixed(2)}
          </Text>
          <Text className={styles.statLabel}>Total Profit/Loss</Text>
        </Stack>
        
        <Stack className={styles.card}>
          <FontIcon 
            iconName="Calculator" 
            className={`${styles.icon} ${Number(summary.averageProfitPerTrade) >= 0 ? styles.positive : styles.negative}`} 
          />
          <Text 
            className={styles.statValue}
            style={{ color: Number(summary.averageProfitPerTrade) >= 0 ? 'green' : 'red' }}
          >
            {Number(summary.averageProfitPerTrade) >= 0 ? '+' : ''}{summary.averageProfitPerTrade}
          </Text>
          <Text className={styles.statLabel}>Avg Profit per Trade</Text>
        </Stack>
      </Stack>
      
      {pagination && pagination.totalPages > 1 && (
        <Text className={styles.paginationNote} style={{ marginTop: '20px', textAlign: 'center' }}>
          * Note: Trade statistics (except Total Trades) reflect only the trades shown on the current page.
        </Text>
      )}
    </Stack>
  );
};

export default TradesSummary;