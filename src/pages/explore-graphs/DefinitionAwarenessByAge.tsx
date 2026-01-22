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
    const age = normalize(r.raw.ageGroup ?? '');
    const awareness = normalize(r.raw.heardOfDigitalSustainabilityDefinition ?? '').toLowerCase();

    if (!age || age.toLowerCase() === 'n/a' || !awareness) return;

    if (!dataMap.has(age)) {
      dataMap.set(age, { yes: 0, no: 0, total: 0 });
    }
    const entry = dataMap.get(age)!;
    entry.total++;
    if (awareness === 'yes') entry.yes++;
    else if (awareness === 'no') entry.no++;
  });

  const sorted = Array.from(dataMap.entries()).sort((a, b) => {
    const aMatch = a[0].match(/^(\d+)/);
    const bMatch = b[0].match(/^(\d+)/);
    if (aMatch && bMatch) {
      return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
    }
    return a[0].localeCompare(b[0]);
  });

  const categories = sorted.map(([age]) => age);
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
  margin: { t: 40, r: 20, b: 40, l: 60 },
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

export const DefinitionAwarenessByAge = ({ onBack }: { onBack: () => void }) => {
  const dataExtractor = useCallback<DataExtractor<HorizontalBarData>>((responses) => {
    const ageCounts = new Map<string, { yes: number; no: number }>();
    let totalValidResponses = 0;

    responses.forEach((r) => {
      const age = normalize(r.raw.ageGroup ?? '');
      const awareness = normalize(r.raw.heardOfDigitalSustainabilityDefinition ?? '').toLowerCase();

      if (!age || age.toLowerCase() === 'n/a' || !awareness) return;
      if (awareness !== 'yes' && awareness !== 'no') return;

      totalValidResponses++;

      if (!ageCounts.has(age)) {
        ageCounts.set(age, { yes: 0, no: 0 });
      }

      const counts = ageCounts.get(age)!;
      if (awareness === 'yes') {
        counts.yes++;
      } else {
        counts.no++;
      }
    });

    const items: { label: string; value: number }[] = [];

    ageCounts.forEach((counts, age) => {
      // Calculate percentages based on TOTAL valid responses (Grand Total)
      const yesPct = totalValidResponses > 0 ? (counts.yes / totalValidResponses) * 100 : 0;
      const noPct = totalValidResponses > 0 ? (counts.no / totalValidResponses) * 100 : 0;

      if (yesPct > 0) items.push({ label: `${age} - Familiar (Yes)`, value: yesPct });
      if (noPct > 0) items.push({ label: `${age} - Not Familiar (No)`, value: noPct });
    });

    return {
      items,
      stats: { numberOfResponses: totalValidResponses },
    };
  }, []);

  return (
    <GenericChart
      graphId="DefinitionAwarenessByAge"
      processor={processor}
      layout={layout}
      isEmbedded={true}
      onBack={onBack}
      dataExtractor={dataExtractor}
      comparisonStrategy={comparisonStrategy}
    />
  );
};
