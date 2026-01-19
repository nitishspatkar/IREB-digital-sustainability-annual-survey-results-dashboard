import { GenericChart } from '../../components/GraphViews';
import type { ChartProcessor } from '../../components/GraphViews';
import type { Layout } from 'plotly.js';

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
  return (
    <GenericChart
      graphId="DefinitionAwarenessByRole"
      processor={processor}
      layout={layout}
      isEmbedded={true}
      onBack={onBack}
    />
  );
};
