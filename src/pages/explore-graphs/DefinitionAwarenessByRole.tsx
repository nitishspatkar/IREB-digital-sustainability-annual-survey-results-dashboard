import { useCallback } from 'react';
import { GenericChart } from '../../components/GraphViews';
import type { ChartProcessor, DataExtractor } from '../../components/GraphViews';
import type { Layout } from 'plotly.js';
import { createDumbbellComparisonStrategy } from '../../components/comparision-components/DumbbellComparisonStrategy';
import type { HorizontalBarData } from '../../components/comparision-components/HorizontalBarComparisonStrategy';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

const processor: ChartProcessor = (responses, palette) => {
  const dataMap = new Map<string, { yes: number; no: number; total: number }>();

  responses.forEach((r) => {
    const role = normalize(r.raw.role ?? '');
    const awareness = normalize(r.raw.heardOfDigitalSustainabilityDefinition ?? '').toLowerCase();

    if (!role || role.toLowerCase() === 'n/a' || !awareness) return;

    if (!dataMap.has(role)) {
      dataMap.set(role, { yes: 0, no: 0, total: 0 });
    }
    const entry = dataMap.get(role)!;
    entry.total++;
    if (awareness === 'yes') entry.yes++;
    else if (awareness === 'no') entry.no++;
  });

  // Sort ascending by total so the largest bar appears at the top in Plotly horizontal view
  const sorted = Array.from(dataMap.entries()).sort((a, b) => a[1].total - b[1].total);

  const categories = sorted.map(([role]) => role);
  const yesValues = sorted.map(([, stats]) => stats.yes);
  const noValues = sorted.map(([, stats]) => stats.no);
  const validResponses = sorted.reduce((acc, [, stats]) => acc + stats.total, 0);

  return {
    traces: [
      {
        y: categories,
        x: yesValues,
        name: 'Familiar (Yes)',
        type: 'bar',
        orientation: 'h',
        marker: { color: palette.spring },
        text: yesValues.map((v) => (v > 0 ? v.toString() : '')),
        textposition: 'inside',
        insidetextanchor: 'middle',
        textfont: {
          family: 'PP Mori, sans-serif',
          size: 13,
          color: '#FFFFFF',
        },
        hoverinfo: 'name' as const,
      },
      {
        y: categories,
        x: noValues,
        name: 'Not Familiar (No)',
        type: 'bar',
        orientation: 'h',
        marker: { color: palette.mandarin },
        text: noValues.map((v) => (v > 0 ? v.toString() : '')),
        textposition: 'inside',
        insidetextanchor: 'middle',
        textfont: {
          family: 'PP Mori, sans-serif',
          size: 13,
          color: '#FFFFFF',
        },
        hoverinfo: 'name' as const,
      },
    ],
    stats: {
      numberOfResponses: validResponses,
    },
  };
};

const comparisonStrategy = createDumbbellComparisonStrategy({
  normalizeToPercentage: false,
  formatAsPercentage: true,
});

const layout: Partial<Layout> = {
  barmode: 'stack',
  margin: { t: 40, r: 20, b: 40, l: 200 },
  legend: {
    orientation: 'h',
    yanchor: 'bottom',
    y: 1.1,
    xanchor: 'right',
    x: 1,
    traceorder: 'normal',
  },
  xaxis: {
    title: {
      text: 'Number of Respondents',
    },
  },
  yaxis: {
    automargin: true,
    ticks: 'outside',
    ticklen: 10,
    tickcolor: 'rgba(0,0,0,0)',
  },
};

export const DefinitionAwarenessByRole = ({ onBack }: { onBack: () => void }) => {
  const dataExtractor = useCallback<DataExtractor<HorizontalBarData>>((responses) => {
    const roleCounts = new Map<string, { yes: number; no: number }>();
    let totalValidResponses = 0;

    responses.forEach((r) => {
      const role = normalize(r.raw.role ?? '');
      const awareness = normalize(r.raw.heardOfDigitalSustainabilityDefinition ?? '').toLowerCase();

      if (!role || role.toLowerCase() === 'n/a' || !awareness) return;
      if (awareness !== 'yes' && awareness !== 'no') return;

      totalValidResponses++;

      if (!roleCounts.has(role)) {
        roleCounts.set(role, { yes: 0, no: 0 });
      }

      const counts = roleCounts.get(role)!;
      if (awareness === 'yes') {
        counts.yes++;
      } else {
        counts.no++;
      }
    });

    const items: { label: string; value: number }[] = [];

    roleCounts.forEach((counts, role) => {
      // Calculate percentages based on TOTAL valid responses
      const yesPct = totalValidResponses > 0 ? (counts.yes / totalValidResponses) * 100 : 0;
      const noPct = totalValidResponses > 0 ? (counts.no / totalValidResponses) * 100 : 0;

      if (yesPct > 0) items.push({ label: `${role} - Familiar (Yes)`, value: yesPct });
      if (noPct > 0) items.push({ label: `${role} - Not Familiar (No)`, value: noPct });
    });

    return {
      items,
      stats: { numberOfResponses: totalValidResponses },
    };
  }, []);

  return (
    <GenericChart
      graphId="DefinitionAwarenessByRole"
      processor={processor}
      layout={layout}
      isEmbedded={true}
      onBack={onBack}
      dataExtractor={dataExtractor}
      comparisonStrategy={comparisonStrategy}
    />
  );
};
