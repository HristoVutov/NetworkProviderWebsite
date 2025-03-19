// RectangleSeries.js - Custom Rectangle series plugin for lightweight-charts
import { customSeriesDefaultOptions } from 'lightweight-charts';

// Define custom renderer for Rectangle series
const rectangleRenderer = {
  draw: (target, series) => {
    const ctx = target.context;
    const timeScale = target.timeScale;
    const priceScale = target.priceScale;
    
    // Get the visible range to only render what's needed
    const timeRange = timeScale.visibleTimeRange();
    if (!timeRange) {
      return;
    }
    
    // Render each rectangle in the series data
    for (const rectangle of series.rectangles) {
      const fromTimePoint = timeScale.timeToCoordinate(rectangle.from);
      const toTimePoint = timeScale.timeToCoordinate(rectangle.to);
      
      // Skip rectangles outside the visible range
      if (toTimePoint < 0 || fromTimePoint > target.width) {
        continue;
      }
      
      const topPricePoint = priceScale.priceToCoordinate(rectangle.top);
      const bottomPricePoint = priceScale.priceToCoordinate(rectangle.bottom);
      
      if (!fromTimePoint || !toTimePoint || !topPricePoint || !bottomPricePoint) {
        continue;
      }
      
      const x = Math.min(fromTimePoint, toTimePoint);
      const y = Math.min(topPricePoint, bottomPricePoint);
      const width = Math.abs(toTimePoint - fromTimePoint);
      const height = Math.abs(bottomPricePoint - topPricePoint);
      
      // Set the fill color with transparency
      ctx.fillStyle = rectangle.color || series.options.color;
      
      // Draw the rectangle
      ctx.fillRect(x, y, width, height);
      
      // Draw the border if enabled
      if (series.options.borderVisible) {
        ctx.strokeStyle = series.options.borderColor;
        ctx.lineWidth = series.options.borderWidth;
        ctx.strokeRect(x, y, width, height);
      }
    }
  }
};

// Rectangle Series plugin definition
export const RectangleSeries = {
  name: 'Rectangle',
  
  // Default options for Rectangle series
  defaultOptions: {
    ...customSeriesDefaultOptions,
    color: 'rgba(0, 0, 0, 0.2)',
    borderVisible: true,
    borderColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
  },
  
  // Create the plugin
  createRenderer: () => rectangleRenderer,
  
  // Series implementation
  Series: class RectangleSeriesImplementation {
    constructor(options) {
      this.options = options;
      this.rectangles = [];
    }
    
    // Set data for the series
    setData(data) {
      this.rectangles = data.map(item => ({
        from: item.time.from,
        to: item.time.to,
        top: item.price.to,
        bottom: item.price.from,
        color: item.color,
      }));
    }
    
    // Update the series
    update(data) {
      this.setData(data);
    }
  }
};

export default RectangleSeries;