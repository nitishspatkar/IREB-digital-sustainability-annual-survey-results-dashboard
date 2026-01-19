import type { Data, Layout } from 'plotly.js';
import type { ComparisonStrategy } from '../GraphViews';
import type { HorizontalBarData } from './HorizontalBarComparisonStrategy';

/**
 * Scatter Plot Comparison Strategy
 *
 * Visualizes comparison between two years using a scatter plot with a diagonal reference line (x=y).
 * - X-axis: Comparison Year (e.g., 2025)
 * - Y-axis: Current Year (e.g., 2026)
 * - Points: Data categories (e.g., Regions)
 *
 * Recommended by Claus O. Wilke for comparing many observations between two time points.
 */
export const scatterPlotComparisonStrategy: ComparisonStrategy<HorizontalBarData> = (
  currentYearData,
  compareYearData,
  currentYear,
  compareYear,
  palette
) => {
  // 1. Prepare Data
  const allLabels = Array.from(
    new Set([
      ...currentYearData.items.map((i) => i.label),
      ...compareYearData.items.map((i) => i.label),
    ])
  );

  const currentTotal = currentYearData.stats.numberOfResponses || 1;
  const compareTotal = compareYearData.stats.numberOfResponses || 1;

  // Calculate percentages
  const getPct = (items: typeof currentYearData.items, label: string, total: number) => {
    const item = items.find((i) => i.label === label);
    return item ? (item.value / total) * 100 : 0;
  };

  const points = allLabels.map((label) => ({
    label,
    x: getPct(compareYearData.items, label, compareTotal), // Old Year
    y: getPct(currentYearData.items, label, currentTotal), // New Year
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
    // Data Points
    {
      type: 'scatter',
      mode: 'markers+text',
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
        color: palette.berry,
        size: 12,
        opacity: 0.9,
        line: {
          color: '#FFFFFF',
          width: 1,
        },
      },
      name: 'Regions',
      hovertemplate:
        `<b>%{text}</b><br>` +
        `${compareYear}: %{x:.1f}%<br>` +
        `${currentYear}: %{y:.1f}%<extra></extra>`,
    },
  ];

  // 3. Define Layout Override
  const layout: Partial<Layout> = {
    xaxis: {
      title: { text: `${compareYear} (%)` },
      range: [0, rangeMax],
      zeroline: false,
      showgrid: true,
      dtick: 10, // Grid every 10%
    },
    yaxis: {
      title: { text: `${currentYear} (%)` },
      range: [0, rangeMax],
      zeroline: false,
      showgrid: true,
      dtick: 10,
      scaleanchor: 'x', // Make axes square (1:1 ratio)
      scaleratio: 1,
    },
    showlegend: false,
    hovermode: 'closest',
    margin: { t: 40, r: 40, b: 60, l: 60 },
    // Reset barmode if it was set in parent
    barmode: undefined,
  };

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
