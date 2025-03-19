import React, { useState, useEffect, useRef } from "react";
import { useParams, useHistory } from "react-router-dom";
import { createChart, ColorType, CandlestickSeries, LineSeries } from 'lightweight-charts';
import { RectangleDrawingTool } from '../../IndicatorCustomSeries';
import axios from "axios";
import {
  Stack,
  Text,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType,
  IconButton,
  DefaultButton,
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  mergeStyleSets
} from '@fluentui/react';
import Header from "../common/Header";

const TradeChart = () => {
  const { tradeId } = useParams();
  const history = useHistory();
  const chartContainerRef = useRef(null);
  
  // State variables
  const [indicatorData, setIndicatorData] = useState(null);
  const [trade, setTrade] = useState(null);
  const [candleData, setCandleData] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartInstance, setChartInstance] = useState(null);

  // Styles for the component
  const styles = mergeStyleSets({
    container: {
      display: 'flex',
      height: 'calc(100vh - 80px)',
      padding: '0 20px 20px',
    },
    chartContainer: {
      width: '90%',
      backgroundColor: '#f8f8f8',
      border: '1px solid #ddd',
      borderRadius: '4px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    sidePanel: {
      width: '10%',
      paddingLeft: '20px',
    },
    cardContainer: {
      maxWidth: '100%',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      backgroundColor: 'white',
      border: '1px solid #edebe9',
      borderRadius: '2px',
    },
    cardHeader: {
      padding: '12px',
      cursor: 'pointer',
      borderBottom: isExpanded ? '1px solid #edebe9' : 'none',
    },
    cardContent: {
      padding: '16px',
      backgroundColor: 'white',
    },
    dataItem: {
      margin: '8px 0',
    },
    strength: {
      fontWeight: 'bold',
      fontSize: '16px',
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
    resultIndicator: {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      display: 'inline-block',
      marginRight: '8px',
    },
    chartPlaceholder: {
      textAlign: 'center',
      padding: '20px',
    },
    tradeDetails: {
      padding: '16px',
      marginBottom: '20px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      borderRadius: '2px',
    },
    tradeHeader: {
      fontWeight: 'bold',
      marginBottom: '8px',
    },
    entryLine: {
      color: '#0078d4',
    },
    stopLossLine: {
      color: 'red',
    },
    targetLine: {
      color: 'green',
    }
  });

  // Fetch the trade data and candle data
  const fetchTradeData = async () => {
    try {
      // First get the trade details to get the OrderTicket
      const tradeResponse = await axios.get(`http://localhost:3001/api/trade/${tradeId}`);
      const tradeData = tradeResponse.data;
      setTrade(tradeData);
      
      // Then get the candle data using the OrderTicket
      if (tradeData.OrderTicket) {
        const candleResponse = await axios.get(`http://localhost:3001/api/csv/${tradeData.OrderTicket}`);
        const formattedCandleData = formatCandleData(candleResponse.data);
        setCandleData(formattedCandleData);
      } else {
        throw new Error("No OrderTicket available for this trade");
      }
    } catch (err) {
      console.error("Error fetching trade or candle data:", err);
      setError("Failed to load trade data. Please try again later.");
      throw err;
    }
  };

  // Format candle data for the chart
  const formatCandleData = (data) => {
    // This function will need to be adjusted based on the actual format of your CSV data
    // Assuming the data is an array of objects with time, open, high, low, close properties
    
    // If the data comes as CSV, you'll need to parse it here
    // For now, assuming it's already parsed into an array of objects
    
    return data.map(candle => ({
      time: new Date(candle.time).getTime() / 1000,
      open: parseFloat(candle.open),
      high: parseFloat(candle.high),
      low: parseFloat(candle.low),
      close: parseFloat(candle.close),
      volume: parseFloat(candle.volume || 0)
    }));
  };

  // Fetch indicator data
  const fetchIndicatorData = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/indicatorData/${tradeId}`);
      setIndicatorData(response.data.length > 0 ? response.data[0] : null);
    } catch (err) {
      console.error("Error fetching indicator data:", err);
      setError("Failed to load indicator data. Please try again later.");
      throw err;
    }
  };

  // Toggle expanded state for the indicator data panel
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Function to get color for result type
  const getResultColor = (result) => {
    switch (result?.toLowerCase()) {
      case 'long':
        return styles.positive;
      case 'short':
        return styles.negative;
      default:
        return styles.neutral;
    }
  };

  // Initialize the chart with data
  const initializeChart = () => {
    if (!chartContainerRef.current || candleData.length === 0 || !trade) return;
    
    // Clear any existing chart
    if (chartContainerRef.current.innerHTML !== '') {
      chartContainerRef.current.innerHTML = '';
    }
    
    // Create new chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });
    
    // Add candlestick series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
    
    // Set the data
    candlestickSeries.setData(candleData);
    
    var rectTool = new RectangleDrawingTool(
      chart,
      candlestickSeries,
      document.getElementById('toolbar'),
      {
        showLabels: false,
      }
    );
    // Add entry, stop loss, and target price lines
    if (trade.Entry) {
      const entryLine = chart.addSeries(LineSeries, {
        color: '#0078d4',
        lineWidth: 2,
        lineStyle: 1, // Solid line
        title: 'Entry',
      });
      entryLine.setData(candleData.map(d => ({ time: d.time, value: trade.Entry })));
    }
    
    if (trade.StopLoss) {
      const stopLossLine = chart.addSeries(LineSeries, {
        color: 'red',
        lineWidth: 2,
        lineStyle: 2, // Dashed line
        title: 'Stop Loss',
      });
      stopLossLine.setData(candleData.map(d => ({ time: d.time, value: trade.StopLoss })));
    }
    
    if (trade.Target) {
      const targetLine = chart.addSeries(LineSeries, {
        color: 'green',
        lineWidth: 2,
        lineStyle: 2, // Dashed line
        title: 'Target',
      });
      targetLine.setData(candleData.map(d => ({ time: d.time, value: trade.Target })));
    }
    
    // Fit content and set up resize handler
    chart.timeScale().fitContent();
    
    // Store chart instance for cleanup
    setChartInstance(chart);
    
    // Add resize listener
    const resizeHandler = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };
    
    window.addEventListener('resize', resizeHandler);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('resize', resizeHandler);
      chart.remove();
    };
  };

  // Column definitions for the indicator data table
  const columns = [
    {
      key: 'time',
      name: 'Time',
      fieldName: 'time',
      minWidth: 100,
      isResizable: true,
      onRender: (item) => {
        const date = new Date(item.time * 1000); // Convert Unix timestamp to JavaScript Date
        return <span>{date.toLocaleTimeString()}</span>;
      }
    },
    {
      key: 'result',
      name: 'Result',
      fieldName: 'result',
      minWidth: 70,
      isResizable: true,
      onRender: (item) => (
        <div>
          <span 
            className={getResultColor(item.result).root} 
            style={{ 
              backgroundColor: item.result?.toLowerCase() === 'long' ? 'green' : 
                item.result?.toLowerCase() === 'short' ? 'red' : 'blue',
              ...styles.resultIndicator
            }} 
          />
          <span>{item.result}</span>
        </div>
      )
    },
    {
      key: 'rsi',
      name: 'RSI',
      fieldName: 'rsi',
      minWidth: 70,
      isResizable: true,
      onRender: (item) => <span>{item.rsi?.toFixed(2) || 'N/A'}</span>
    }
  ];

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await fetchTradeData();
        await fetchIndicatorData();
      } catch (err) {
        console.error("Error in data fetching:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Cleanup function
    return () => {
      if (chartInstance) {
        chartInstance.remove();
      }
    };
  }, [tradeId]);

  // Initialize chart when data is loaded
  useEffect(() => {
    if (!loading && candleData.length > 0 && trade) {
      const cleanup = initializeChart();
      return cleanup;
    }
  }, [loading, candleData, trade]);

  return (
    <>
      <Header />
      <div className={styles.container}>
        {loading ? (
          <Spinner size={SpinnerSize.large} label="Loading chart data..." />
        ) : error ? (
          <MessageBar messageBarType={MessageBarType.error} isMultiline={false}>
            {error}
          </MessageBar>
        ) : (
          <>
            {/* Main Chart Container */}
            <div className={styles.chartContainer}>
              <div id="toolbar" class="column"></div>
              <div ref={chartContainerRef} id="chartTV" style={{ width: '100%', height: '100%' }}>
                {!candleData.length && (
                  <div className={styles.chartPlaceholder}>
                    <Text>No chart data available for this trade.</Text>
                  </div>
                )}
              </div>
            </div>

            {/* Side Panel */}
            <div className={styles.sidePanel}>
              {/* Trade Details Section */}
              {trade && (
                <Stack className={styles.tradeDetails}>
                  <Text variant="large" className={styles.tradeHeader}>Trade Details</Text>
                  <Stack tokens={{ childrenGap: 8 }}>
                    <Text className={styles.dataItem}>
                      <strong>Pair:</strong> {trade.Pair}
                    </Text>
                    <Text className={styles.dataItem}>
                      <strong>Status:</strong> {trade.Status}
                    </Text>
                    <Text className={styles.dataItem}>
                      <strong>Outcome:</strong> {trade.Outcome}
                    </Text>
                    <Text className={styles.dataItem}>
                      <strong>Entry:</strong> <span className={styles.entryLine.root}>{Number(trade.Entry).toFixed(5)}</span>
                    </Text>
                    <Text className={styles.dataItem}>
                      <strong>Stop Loss:</strong> <span className={styles.stopLossLine.root}>{Number(trade.StopLoss).toFixed(5)}</span>
                    </Text>
                    <Text className={styles.dataItem}>
                      <strong>Target:</strong> <span className={styles.targetLine.root}>{Number(trade.Target).toFixed(5)}</span>
                    </Text>
                    <Text className={styles.dataItem}>
                      <strong>Risk/Reward:</strong> {Number(trade.RiskReward).toFixed(2)}
                    </Text>
                    <Text className={styles.dataItem}>
                      <strong>P/L:</strong> <span style={{ 
                        color: Number(trade.Profitloss) > 0 ? 'green' : 
                               Number(trade.Profitloss) < 0 ? 'red' : 'inherit'
                      }}>
                        {Number(trade.Profitloss).toFixed(2)}
                      </span>
                    </Text>
                  </Stack>
                </Stack>
              )}

              {/* Indicator Data Section */}
              {indicatorData && (
                <Stack className={styles.cardContainer}>
                  <Stack 
                    onClick={toggleExpanded}
                    styles={{ root: styles.cardHeader }}
                  >
                    <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                      <Text variant="mediumPlus">Indicator Data</Text>
                      <IconButton
                        iconProps={{ iconName: isExpanded ? 'ChevronUp' : 'ChevronDown' }}
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        onClick={toggleExpanded}
                      />
                    </Stack>
                    
                    {/* Summary data (always visible) */}
                    <Stack tokens={{ padding: 10, childrenGap: 5 }}>
                      <Text className={styles.dataItem}>
                        Strategy: {indicatorData.StrategyName}
                      </Text>
                      <Text className={styles.dataItem}>
                        Strength: <span className={styles.strength}>
                          {indicatorData.Strength.toFixed(1)}
                        </span>
                      </Text>
                      <Text className={styles.dataItem}>
                        Data Points: {indicatorData.Data?.length || 0}
                      </Text>
                      {indicatorData.Data?.length > 0 && (
                        <Text className={styles.dataItem}>
                          Last Result: 
                          <span 
                            style={{ 
                              color: indicatorData.Data[indicatorData.Data.length - 1].result?.toLowerCase() === 'long' ? 'green' : 
                                indicatorData.Data[indicatorData.Data.length - 1].result?.toLowerCase() === 'short' ? 'red' : 'blue' 
                            }}
                          >
                            {` ${indicatorData.Data[indicatorData.Data.length - 1].result}`}
                          </span>
                        </Text>
                      )}
                    </Stack>
                  </Stack>

                  {/* Expanded content */}
                  {isExpanded && indicatorData.Data?.length > 0 && (
                    <Stack className={styles.cardContent}>
                      <Text variant="medium" style={{ marginBottom: '10px' }}>
                        Detailed Data:
                      </Text>
                      <DetailsList
                        items={indicatorData.Data}
                        columns={columns}
                        selectionMode={SelectionMode.none}
                        layoutMode={DetailsListLayoutMode.fixedColumns}
                        isHeaderVisible={true}
                        compact={true}
                      />
                    </Stack>
                  )}
                </Stack>
              )}
              
              {/* Back button */}
              <DefaultButton
                text="Back to Trades"
                iconProps={{ iconName: 'ChevronLeft' }}
                onClick={() => history.goBack()}
                styles={{ root: { marginTop: '20px' } }}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default TradeChart;