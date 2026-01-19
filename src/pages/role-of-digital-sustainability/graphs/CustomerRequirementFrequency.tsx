import {
  GenericChart,
  type ChartProcessor,
  type DataExtractor,
} from '../../../components/GraphViews';
import { type HorizontalBarData } from '../../../components/comparision-components/HorizontalBarComparisonStrategy';
import { dumbbellComparisonStrategy } from '../../../components/comparision-components/DumbbellComparisonStrategy';

// Define the logical order of answers
const frequencyOrder = [
  'For every project or digital solution',
  'For most projects or digital solutions',
  'For some projects or digital solutions',
  'Rarely, but it has happened',
  'Never',
];

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

// --- DATA EXTRACTOR ---
const customerRequirementDataExtractor: DataExtractor<HorizontalBarData> = (responses) => {
  const counts = new Map<string, number>();
  frequencyOrder.forEach((label) => counts.set(label, 0));

  responses.forEach((r) => {
    const raw = normalize(r.raw.customerRequirementFrequency ?? '');
    if (counts.has(raw)) {
      counts.set(raw, (counts.get(raw) ?? 0) + 1);
    }
  });

  // Sort based on the predefined logical order
  const sorted = Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => frequencyOrder.indexOf(a.label) - frequencyOrder.indexOf(b.label));

  const total = sorted.reduce((sum, s) => sum + s.count, 0);

  return {
    items: sorted.map((s) => ({ label: s.label, value: s.count })),
    stats: {
      numberOfResponses: total,
    },
  };
};

// --- PROCESSOR ---
const processData: ChartProcessor = (responses, palette) => {
  const data = customerRequirementDataExtractor(responses);
  const sorted = data.items;

  return {
    traces: [
      {
        type: 'bar',
        orientation: 'h',
        x: sorted.map((s) => s.value),
        y: sorted.map((s) => s.label),
        marker: { color: palette.berry },
        text: sorted.map((s) => s.value.toString()),
        textposition: 'outside',
        textfont: {
          family: 'PP Mori, sans-serif',
          size: 12,
          color: palette.grey,
        },
        cliponaxis: false,
        hoverinfo: 'none',
      },
    ],
    stats: data.stats,
  };
};

// The Component
const CustomerRequirementFrequency = () => {
  return (
    <GenericChart
      graphId="CustomerRequirementFrequency"
      processor={processData}
      layout={{
        margin: { t: 50, r: 40, b: 60, l: 250 },
        xaxis: { title: { text: 'Number of Respondents' } },
        yaxis: {
          automargin: true,
          ticks: 'outside',
          ticklen: 10,
          tickcolor: 'rgba(0,0,0,0)',
        },
      }}
      dataExtractor={customerRequirementDataExtractor}
      comparisonStrategy={dumbbellComparisonStrategy}
    />
  );
};

export default CustomerRequirementFrequency;
