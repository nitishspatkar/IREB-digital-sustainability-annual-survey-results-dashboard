import type { Data, Layout } from 'plotly.js';
import type { ComparisonStrategy, ChartPalette } from '../GraphViews';
import type { HorizontalBarData } from './HorizontalBarComparisonStrategy';

export interface ScatterPlotOptions {
  showLegend?: boolean;
  colorMap?: Record<string, string | keyof ChartPalette>;
}

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
        if (mapped in palette) {
          return palette[mapped as keyof ChartPalette];
        }
        return mapped as string;
      }
      return defaultColors[index % defaultColors.length];
    };

    const currentTotal = currentYearData.stats.numberOfResponses || 1;
    const compareTotal = compareYearData.stats.numberOfResponses || 1;

    const getPct = (items: typeof currentYearData.items, label: string, total: number) => {
      const item = items.find((i) => i.label === label);
      return item ? (item.value / total) * 100 : 0;
    };

    const points = allLabels.map((label, index) => ({
      label,
      x: getPct(compareYearData.items, label, compareTotal),
      y: getPct(currentYearData.items, label, currentTotal),
      color: getColor(label, index),
    }));

    const maxVal = Math.max(...points.map((p) => p.x), ...points.map((p) => p.y));
    const rangeMax = Math.ceil(maxVal * 1.1);

    // 2. Create Traces
    const traces: Data[] = [
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

    if (showLegend) {
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
            line: { color: '#FFFFFF', width: 1 },
          },
          name: point.label,
          hovertemplate:
            `<b>${point.label}</b><br>` +
            `${compareYear}: ${point.x.toFixed(1)}%<br>` +
            `${currentYear}: ${point.y.toFixed(1)}%<extra></extra>`,
        });
      });
    } else {
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
          line: { color: '#FFFFFF', width: 1 },
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
        dtick: 10,
      },
      yaxis: {
        title: { text: `${currentYear} (%)` },
        range: [-5, rangeMax],
        zeroline: false,
        showgrid: true,
        dtick: 10,
        scaleanchor: 'x',
        scaleratio: 1,
      },
      showlegend: false,
      hovermode: 'closest',
      margin: { t: 40, r: 40, b: 60, l: 60 },
      barmode: undefined,
    };

    if (showLegend) {
      layout.legend = {
        orientation: 'v',
        // FIX: Position inside/overlay (x=1) instead of outside (x=1.02)
        x: 1,
        xanchor: 'right',
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

      layout.updatemenus = [
        {
          type: 'buttons',
          active: -1,
          showactive: true,
          // FIX: Position button aligned with right edge
          x: 1,
          xanchor: 'right',
          y: 1.1, // Slightly above the graph
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

export const scatterPlotComparisonStrategy = createScatterPlotComparisonStrategy();
