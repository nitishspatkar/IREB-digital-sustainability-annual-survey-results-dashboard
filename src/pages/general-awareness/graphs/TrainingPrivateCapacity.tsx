import {
  GenericChart,
  type ChartProcessor,
  type DataExtractor,
} from '../../../components/GraphViews';
import {
  horizontalBarComparisonStrategy,
  type HorizontalBarData,
} from '../../../components/comparision-components/HorizontalBarComparisonStrategy';

// Define the categories and their search terms
const capacityOptions = [
  { label: 'Yes', searchTerms: ['yes'] },
  { label: 'No', searchTerms: ['no'] },
  {
    label: 'My organization paid it on some occasions, and i paid it myself on others.',
    searchTerms: ['my organization paid it on some occasions, and i paid it myself on others.'],
  },
];

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

// --- DATA EXTRACTOR ---
const trainingPrivateCapacityDataExtractor: DataExtractor<HorizontalBarData> = (responses) => {
  const counts = new Map<string, number>();
  capacityOptions.forEach((opt) => counts.set(opt.label, 0));

  const participants = responses.filter(
    (r) => normalize(r.raw.participatedInTraining ?? '').toLowerCase() === 'yes'
  );

  participants.forEach((r) => {
    const raw = normalize(r.raw.trainingPrivateCapacity ?? '').toLowerCase();
    if (!raw || raw === 'n/a') return;

    const matchedOption = capacityOptions.find((opt) =>
      opt.searchTerms.some((term) => raw.startsWith(term))
    );

    if (matchedOption) {
      counts.set(matchedOption.label, (counts.get(matchedOption.label) ?? 0) + 1);
    }
  });

  const stats = Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => a.count - b.count);

  const total = stats.reduce((sum, s) => sum + s.count, 0);

  return {
    items: stats.map((s) => ({ label: s.label, value: s.count })),
    stats: {
      numberOfResponses: total,
      totalEligible: participants.length,
    },
  };
};

// --- PROCESSOR ---
const processData: ChartProcessor = (responses, palette) => {
  const data = trainingPrivateCapacityDataExtractor(responses);

  const stats = data.items.map((item) => ({ label: item.label, count: item.value }));

  return {
    traces: [
      {
        type: 'bar',
        orientation: 'h',
        x: stats.map((s) => s.count),
        y: stats.map((s) => s.label),
        marker: {
          color: stats.map((s) => {
            if (s.label === 'Yes') return palette.spring;
            if (s.label === 'No') return palette.mandarin;
            return palette.grey02;
          }),
        },
        text: stats.map((s) => s.count.toString()),
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
const TrainingPrivateCapacity = () => {
  return (
    <GenericChart
      graphId="TrainingPrivateCapacity"
      processor={processData}
      layout={{
        margin: { t: 60, r: 40, b: 60, l: 200 },
        xaxis: { title: { text: 'Number of Respondents' } },
        yaxis: {
          automargin: true,
          ticks: 'outside',
          ticklen: 10,
          tickcolor: 'rgba(0,0,0,0)',
        },
      }}
      dataExtractor={trainingPrivateCapacityDataExtractor}
      comparisonStrategy={horizontalBarComparisonStrategy}
    />
  );
};

export default TrainingPrivateCapacity;
