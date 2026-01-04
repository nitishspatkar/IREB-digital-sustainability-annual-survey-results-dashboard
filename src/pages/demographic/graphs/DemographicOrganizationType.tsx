import { GenericChart } from '../../../components/GraphViews';
import type { ChartProcessor } from '../../../components/GraphViews';

// Helper function to normalize organization type strings
const normalizeOrganizationType = (value: string) => value.replace(/\s+/g, ' ').trim();

// 1. The Logic (Pure Function)
// It receives data and colors. It returns Traces and Stats.
const processData: ChartProcessor = (responses, palette) => {
  const counts = new Map<string, number>();

  responses.forEach((response) => {
    const orgType = normalizeOrganizationType(response.raw.organizationType ?? '');
    if (orgType.length > 0 && orgType.toLowerCase() !== 'n/a') {
      counts.set(orgType, (counts.get(orgType) ?? 0) + 1);
    }
  });

  // Sort ascending by count so highest bar is at the top
  const sorted = Array.from(counts.entries()).sort((a, b) => a[1] - b[1]);
  const total = sorted.reduce((sum, [, count]) => sum + count, 0);

  return {
    traces: [
      {
        type: 'bar',
        orientation: 'h',
        x: sorted.map(([, count]) => count),
        y: sorted.map(([label]) => label),
        marker: { color: palette.berry },
        text: sorted.map(([, count]) => count.toString()),
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

// 2. The Component
const DemographicOrganizationType = () => {
  return (
    <GenericChart
      graphId="DemographicOrganizationType"
      processor={processData}
      layout={{
        margin: { t: 50, r: 40, b: 40, l: 200 },
        xaxis: { title: { text: 'Number of Respondents' } },
        yaxis: {
          automargin: true,
          ticks: 'outside',
          ticklen: 10,
          tickcolor: 'rgba(0,0,0,0)',
        },
      }}
    />
  );
};

export default DemographicOrganizationType;
