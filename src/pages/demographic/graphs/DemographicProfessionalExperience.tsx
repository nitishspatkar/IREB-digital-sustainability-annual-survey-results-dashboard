import { GenericChart } from '../../../components/GraphViews';
import type { ChartProcessor } from '../../../components/GraphViews';

// Helper to sort experience ranges naturally
const sortExperience = (a: string, b: string) => {
  const aMatch = a.match(/^(\d+)/);
  const bMatch = b.match(/^(\d+)/);

  if (a.startsWith('Less than')) return -1;
  if (b.startsWith('Less than')) return 1;
  if (a.startsWith('More than')) return 1;
  if (b.startsWith('More than')) return -1;
  if (aMatch && bMatch) {
    return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
  }

  return a.localeCompare(b);
};

// The Logic (Pure Function)
const processData: ChartProcessor = (responses, palette) => {
  const counts = new Map<string, number>();

  responses.forEach((response) => {
    const experience = response.raw.professionalExperienceYears ?? '';
    if (experience.length > 0 && experience.toLowerCase() !== 'n/a') {
      counts.set(experience, (counts.get(experience) ?? 0) + 1);
    }
  });

  const sorted = Array.from(counts.entries())
    .map(([experience, count]) => ({ experience, count }))
    .sort((a, b) => sortExperience(a.experience, b.experience));

  const total = sorted.reduce((sum, stat) => sum + stat.count, 0);

  return {
    traces: [
      {
        type: 'bar',
        x: sorted.map((item) => item.experience),
        y: sorted.map((item) => item.count),
        marker: { color: palette.berry },
        text: sorted.map((item) => item.count.toString()),
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
export function DemographicProfessionalExperience() {
  return (
    <GenericChart
      graphId="DemographicProfessionalExperience"
      processor={processData}
      layout={{
        margin: { t: 50, r: 40, b: 60, l: 60 },
        xaxis: {
          automargin: true,
          title: { text: 'Years of Experience' },
        },
        yaxis: {
          title: { text: 'Number of Respondents' },
        },
      }}
    />
  );
}
