import { GenericChart } from '../../components/GraphViews';
import type { ChartProcessor } from '../../components/GraphViews';
import type { Layout } from 'plotly.js';

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
        textposition: 'auto',
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
        textposition: 'auto',
        hoverinfo: 'name' as const,
      },
    ],
    stats: {
      numberOfResponses: validResponses,
    },
  };
};

const layout: Partial<Layout> = {
  barmode: 'stack',
  margin: { t: 40, r: 20, b: 40, l: 60 },
  legend: {
    orientation: 'h',
    y: 1.1,
    x: 0,
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
  return (
    <GenericChart
      graphId="DefinitionAwarenessByAge"
      processor={processor}
      layout={layout}
      isEmbedded={true}
      onBack={onBack}
    />
  );
};
