import { GenericChart } from '../../../components/GraphViews';
import type { ChartProcessor } from '../../../components/GraphViews';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

// The Logic (Pure Function)
const processData: ChartProcessor = (responses, palette) => {
  const counts = new Map<string, number>();
  counts.set('Yes', 0);
  counts.set('No', 0);

  responses.forEach((r) => {
    const raw = normalize(r.raw.participatedInTraining ?? '');
    const lower = raw.toLowerCase();

    if (lower === 'yes') {
      counts.set('Yes', (counts.get('Yes') ?? 0) + 1);
    } else if (lower === 'no') {
      counts.set('No', (counts.get('No') ?? 0) + 1);
    }
  });

  const labels = ['Yes', 'No'];
  const values = labels.map((label) => counts.get(label) ?? 0);
  const total = values.reduce((a, b) => a + b, 0);

  return {
    traces: [
      {
        type: 'bar',
        x: labels,
        y: values,
        marker: {
          color: labels.map((label) => (label === 'Yes' ? palette.spring : palette.mandarin)),
        },
        text: values.map((v) => v.toString()),
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
    stats: {
      numberOfResponses: total,
    },
  };
};

// The Component
const TrainingParticipation = () => {
  return (
    <GenericChart
      graphId="TrainingParticipation"
      processor={processData}
      layout={{
        margin: { t: 60, r: 20, b: 60, l: 48 },
        yaxis: { title: { text: 'Number of Respondents' } },
      }}
    />
  );
};

export default TrainingParticipation;
