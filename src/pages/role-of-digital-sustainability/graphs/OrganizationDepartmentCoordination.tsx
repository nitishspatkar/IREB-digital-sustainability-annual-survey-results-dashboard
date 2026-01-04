import { GenericChart } from '../../../components/GraphViews';
import type { ChartProcessor } from '../../../components/GraphViews';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

// The Logic (Pure Function)
// Precondition: Q17 = Yes (organizationIncorporatesSustainablePractices)
const processData: ChartProcessor = (responses, palette) => {
  const filteredResponses = responses.filter(
    (r) =>
      normalize(r.raw.organizationIncorporatesSustainablePractices ?? '').toLowerCase() === 'yes'
  );

  const counts = new Map<string, number>();
  counts.set('Yes', 0);
  counts.set('No', 0);
  counts.set('Not sure', 0);

  filteredResponses.forEach((r) => {
    const raw = normalize(r.raw.organizationDepartmentCoordination ?? '');
    const lower = raw.toLowerCase();

    if (lower === 'yes') {
      counts.set('Yes', (counts.get('Yes') ?? 0) + 1);
    } else if (lower === 'no') {
      counts.set('No', (counts.get('No') ?? 0) + 1);
    } else if (lower === 'not sure') {
      counts.set('Not sure', (counts.get('Not sure') ?? 0) + 1);
    }
  });

  const labels = ['Yes', 'No', 'Not sure'];
  const values = labels.map((label) => counts.get(label) ?? 0);
  const total = values.reduce((a, b) => a + b, 0);

  return {
    traces: [
      {
        type: 'bar',
        x: labels,
        y: values,
        marker: {
          color: labels.map((label) => {
            if (label === 'Yes') return palette.spring;
            if (label === 'No') return palette.mandarin;
            return palette.grey02;
          }),
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
      totalEligible: filteredResponses.length,
    },
  };
};

// The Component
const OrganizationDepartmentCoordination = () => {
  return (
    <GenericChart
      graphId="OrganizationDepartmentCoordination"
      processor={processData}
      layout={{
        margin: { t: 50, r: 20, b: 60, l: 48 },
        yaxis: { title: { text: 'Number of Respondents' } },
      }}
    />
  );
};

export default OrganizationDepartmentCoordination;
