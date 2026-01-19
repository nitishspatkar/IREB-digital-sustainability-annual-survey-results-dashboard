import type { Data, Layout } from 'plotly.js';
import type { ComparisonStrategy, ChartPalette } from '../GraphViews';
import type { HorizontalBarData } from './HorizontalBarComparisonStrategy';

export interface ScatterPlotOptions {
  /**
   * Whether to show a legend instead of text labels on points.
   * When true, shows a collapsible legend with a toggle button.
   * When false, shows text labels on each point.
   * @default true
   */
  showLegend?: boolean;
  /**
   * Optional mapping of labels to colors.
   * Can be a direct color string (hex, rgb) or a key of the ChartPalette (e.g., 'berry', 'spring').
   * If a label is not found, a default color from the palette will be used.
   */
  colorMap?: Record<string, string | keyof ChartPalette>;
}

/**
 * Creates a Scatter Plot Comparison Strategy with configurable options
 *
 * Visualizes comparison between two years using a scatter plot with a diagonal reference line (x=y).
 * - X-axis: Comparison Year (e.g., 2025)
 * - Y-axis: Current Year (e.g., 2026)
 * - Points: Data categories (e.g., Regions)
 *
 * Recommended by Claus O. Wilke for comparing many observations between two time points.
 */
export const createScatterPlotComparisonStrategy = (
  options: ScatterPlotOptions = {}
): ComparisonStrategy<HorizontalBarData> => {
  const { showLegend = true, colorMap = {} } = options;

  return (currentYearData, compareYearData, currentYear, compareYear, palette) => {
    // 1. Prepare Data
    const allLabels = Array.from(
      new Set([
        ...currentYearData.items.map((i) => i.label),
        ...compareYearData.items.map((i) => i.label),
      ])
    );

    const defaultColors = [
      palette.berry,
      palette.spring,
      palette.mandarin,
      palette.transport,
      palette.lightBerry,
      palette.lightSpring,
      palette.darkSpring,
    ];

    const getColor = (label: string, index: number) => {
      const mapped = colorMap[label];
      if (mapped) {
        // If mapped value is a key in the palette, use that color
        if (mapped in palette) {
          return palette[mapped as keyof ChartPalette];
        }
        // Otherwise assume it's a direct color string
        return mapped as string;
      }
      return defaultColors[index % defaultColors.length];
    };

    const currentTotal = currentYearData.stats.numberOfResponses || 1;
    const compareTotal = compareYearData.stats.numberOfResponses || 1;

    // Calculate percentages
    const getPct = (items: typeof currentYearData.items, label: string, total: number) => {
      const item = items.find((i) => i.label === label);
      return item ? (item.value / total) * 100 : 0;
    };

    const points = allLabels.map((label, index) => ({
      label,
      x: getPct(compareYearData.items, label, compareTotal), // Old Year
      y: getPct(currentYearData.items, label, currentTotal), // New Year
      color: getColor(label, index),
    }));

    // Determine axis range (0 to max value + padding)
    const maxVal = Math.max(...points.map((p) => p.x), ...points.map((p) => p.y));
    // Round up to next 10, or at least 5
    const rangeMax = Math.ceil(maxVal * 1.1);

    // 2. Create Traces
    const traces: Data[] = [
      // Diagonal Reference Line (x=y)
      {
        type: 'scatter',
        mode: 'lines',
        x: [0, rangeMax],
        y: [0, rangeMax],
        line: {
          color: palette.grey02,
          dash: 'dot',
          width: 2,
        },
        hoverinfo: 'skip',
        showlegend: false,
        opacity: 0.5,
      },
    ];

    // Add data points - either as separate traces for legend or single trace with text
    if (showLegend) {
      // Create a separate trace for each point to show in legend
      points.forEach((point) => {
        traces.push({
          type: 'scatter',
          mode: 'markers',
          x: [point.x],
          y: [point.y],
          marker: {
            color: point.color,
            size: 12,
            opacity: 0.9,
            line: {
              color: '#FFFFFF',
              width: 1,
            },
          },
          name: point.label,
          hovertemplate:
            `<b>${point.label}</b><br>` +
            `${compareYear}: ${point.x.toFixed(1)}%<br>` +
            `${currentYear}: ${point.y.toFixed(1)}%<extra></extra>`,
        });
      });
    } else {
      // Single trace with text labels on points
      traces.push({
        type: 'scatter',
        mode: 'markers',
        x: points.map((p) => p.x),
        y: points.map((p) => p.y),
        text: points.map((p) => p.label),
        textposition: 'top center',
        textfont: {
          family: 'PP Mori, sans-serif',
          size: 11,
          color: palette.night,
        },
        marker: {
          color: points.map((p) => p.color),
          size: 12,
          opacity: 0.9,
          line: {
            color: '#FFFFFF',
            width: 1,
          },
        },
        name: 'Data Points',
        showlegend: false,
        hovertemplate:
          `<b>%{text}</b><br>` +
          `${compareYear}: %{x:.1f}%<br>` +
          `${currentYear}: %{y:.1f}%<extra></extra>`,
      });
    }

    // 3. Define Layout Override
    const layout: Partial<Layout> = {
      xaxis: {
        title: { text: `${compareYear} (%)` },
        range: [-5, rangeMax],
        zeroline: false,
        showgrid: true,
        dtick: 10, // Grid every 10%
      },
      yaxis: {
        title: { text: `${currentYear} (%)` },
        range: [-5, rangeMax],
        zeroline: false,
        showgrid: true,
        dtick: 10,
        scaleanchor: 'x', // Make axes square (1:1 ratio)
        scaleratio: 1,
      },
      showlegend: false, // Start hidden, user must click toggle to show
      hovermode: 'closest',
      margin: { t: 40, r: 40, b: 60, l: 60 },
      // Reset barmode if it was set in parent
      barmode: undefined,
    };

    // Add legend configuration if showing legend
    if (showLegend) {
      layout.legend = {
        orientation: 'v',
        x: 1.02,
        xanchor: 'left',
        y: 1,
        yanchor: 'top',
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        bordercolor: palette.grey02,
        borderwidth: 1,
        font: {
          family: 'PP Mori, sans-serif',
          size: 11,
        },
      };

      // Add a toggle button to show/hide the legend
      layout.updatemenus = [
        {
          type: 'buttons',
          // Start with no button active (-1), ensuring first click triggers 'args' (show)
          active: -1,
          showactive: true,
          x: 1.02,
          xanchor: 'left',
          y: 1.05,
          yanchor: 'bottom',
          buttons: [
            {
              label: 'Toggle Legend',
              method: 'relayout',
              args: [{ showlegend: true }],
              args2: [{ showlegend: false }],
            },
          ],
        },
      ];
    }

    const combinedResponses =
      currentYearData.stats.numberOfResponses + compareYearData.stats.numberOfResponses;
    const combinedEligible =
      (currentYearData.stats.totalEligible ?? 0) + (compareYearData.stats.totalEligible ?? 0);

    return {
      traces,
      layout,
      stats: {
        numberOfResponses: combinedResponses,
        totalEligible: combinedEligible > 0 ? combinedEligible : undefined,
      },
    };
  };
};

/**
 * Default Scatter Plot Comparison Strategy (with legend)
 * Use createScatterPlotComparisonStrategy({ showLegend: false }) for no-legend variant
 */
export const scatterPlotComparisonStrategy = createScatterPlotComparisonStrategy();
