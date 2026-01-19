import type { Data } from 'plotly.js';
import type { ComparisonStrategy } from '../GraphViews';

// Re-export for type inference in strategy implementations
export type { ChartPalette } from '../GraphViews';

/**
 * Data structure for stacked horizontal bar chart comparisons
 */
export interface StackedBarData {
  categories: string[]; // e.g., age groups, roles, etc.
  series: Array<{
    label: string; // e.g., 'Yes', 'No', 'Not sure'
    values: number[]; // values for each category
    color?: string; // optional color for this series
  }>;
  stats: {
    numberOfResponses: number;
    totalEligible?: number;
  };
}

/**
 * Reusable comparison strategy for stacked horizontal bar charts.
 * Creates a side-by-side comparison where each year has its own grouped categories.
 */
export const stackedBarComparisonStrategy: ComparisonStrategy<StackedBarData> = (
  currentYearData,
  compareYearData,
  currentYear,
  compareYear,
  palette
) => {
  const getSeriesColor = (label: string, index: number) => {
    const normalized = label.trim().toLowerCase();
    if (normalized === 'yes') return palette.spring;
    if (normalized === 'no') return palette.mandarin;
    if (normalized === 'not sure') return palette.grey02;

    const fallbackPalette = [
      palette.berry,
      palette.lightBerry,
      palette.lightSpring,
      palette.darkSpring,
      palette.transport,
      palette.grey,
    ];

    return fallbackPalette[index % fallbackPalette.length] ?? palette.grey02;
  };

  // Create combined Y-axis labels with year suffixes
  const currentYearLabels = currentYearData.categories.map((cat) => `${cat} (${currentYear})`);
  const compareYearLabels = compareYearData.categories.map((cat) => `${cat} (${compareYear})`);

  // Interleave the labels with spacing: [cat1-2025, cat1-2026, spacer, cat2-2025, cat2-2026, spacer, ...]
  const allLabels: string[] = [];
  const maxLength = Math.max(currentYearData.categories.length, compareYearData.categories.length);

  for (let i = 0; i < maxLength; i++) {
    if (i < currentYearData.categories.length) {
      allLabels.push(currentYearLabels[i]);
    }
    if (i < compareYearData.categories.length) {
      allLabels.push(compareYearLabels[i]);
    }
    // Add spacing between comparison pairs (except after the last pair)
    if (i < maxLength - 1) {
      // Use unique whitespace strings to prevent Plotly from grouping identical "empty" labels together
      allLabels.push(' '.repeat(i + 1));
    }
  }

  // Build traces for each series (Yes, No, Not sure, etc.)
  const traces: Data[] = [];

  // Get all unique series labels from both years
  const allSeriesLabels = Array.from(
    new Set([
      ...currentYearData.series.map((s) => s.label),
      ...compareYearData.series.map((s) => s.label),
    ])
  );

  allSeriesLabels.forEach((seriesLabel, seriesIndex) => {
    // Find the series in both years
    const currentSeries = currentYearData.series.find((s) => s.label === seriesLabel);
    const compareSeries = compareYearData.series.find((s) => s.label === seriesLabel);

    // Get color (prefer current year's color, fallback to compare year)
    const baseColor =
      currentSeries?.color || compareSeries?.color || getSeriesColor(seriesLabel, seriesIndex);

    // Build interleaved values with spacing and track which year each value belongs to
    const values: number[] = [];
    const opacities: number[] = [];
    const textValues: string[] = [];

    for (let i = 0; i < maxLength; i++) {
      // Current year value
      if (i < currentYearData.categories.length) {
        const val = currentSeries?.values[i] ?? 0;
        values.push(val);
        opacities.push(1.0); // Full opacity for current year
        textValues.push(val > 0 ? val.toString() : '');
      }
      // Compare year value
      if (i < compareYearData.categories.length) {
        const val = compareSeries?.values[i] ?? 0;
        values.push(val);
        opacities.push(0.65); // Reduced opacity for compare year
        textValues.push(val > 0 ? val.toString() : '');
      }
      // Spacer
      if (i < maxLength - 1) {
        values.push(0);
        opacities.push(0);
        textValues.push('');
      }
    }

    traces.push({
      type: 'bar',
      name: seriesLabel,
      orientation: 'h',
      y: allLabels,
      x: values,
      marker: {
        color: baseColor,
        opacity: opacities,
      },
      text: textValues,
      textposition: 'inside',
      insidetextanchor: 'middle',
      textfont: {
        family: 'PP Mori, sans-serif',
        size: 13,
        color: '#FFFFFF',
      },
      hoverinfo: 'x+y+name',
    });
  });

  // Combine stats - show both years' response counts
  const combinedResponses =
    currentYearData.stats.numberOfResponses + compareYearData.stats.numberOfResponses;
  const combinedEligible =
    (currentYearData.stats.totalEligible ?? 0) + (compareYearData.stats.totalEligible ?? 0);

  return {
    traces,
    stats: {
      numberOfResponses: combinedResponses,
      totalEligible: combinedEligible > 0 ? combinedEligible : undefined,
    },
  };
};
