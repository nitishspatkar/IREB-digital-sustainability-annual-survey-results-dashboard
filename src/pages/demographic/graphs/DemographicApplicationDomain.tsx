import { GenericChart } from '../../../components/GraphViews';
import type { ChartProcessor } from '../../../components/GraphViews';
import { DemographicApplicationDomainOther } from '../../explore-graphs/DemographicApplicationDomainOther';

const normalize = (val: string) => val.replace(/\s+/g, ' ').trim();

const processData: ChartProcessor = (responses, palette) => {
  const counts = new Map<string, number>();

  responses.forEach((r) => {
    const val = normalize(r.raw.primaryApplicationDomain ?? '');
    if (val && val.toLowerCase() !== 'n/a') {
      counts.set(val, (counts.get(val) ?? 0) + 1);
    }
  });

  const stats = Array.from(counts.entries())
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count);

  const numResp = stats.reduce((acc, curr) => acc + curr.count, 0);

  return {
    traces: [
      {
        x: stats.map((i) => i.count),
        y: stats.map((i) => i.domain),
        type: 'bar',
        orientation: 'h',
        marker: { color: palette.berry },
        text: stats.map((i) => i.count.toString()),
        textposition: 'outside',
        hoverinfo: 'y+x',
        textfont: { color: palette.grey },
      },
    ],
    stats: {
      numberOfResponses: numResp,
    },
  };
};

export const DemographicApplicationDomain = ({ onExplore }: { onExplore?: () => void }) => {
  return (
    <GenericChart
      graphId="DemographicApplicationDomain"
      processor={processData}
      layout={{
        margin: { t: 40, r: 40, b: 40, l: 250 },
        xaxis: {
          title: {
            text: 'Number of Respondents',
          },
        },
        yaxis: {
          autorange: 'reversed',
          showline: true,
          automargin: true,
          ticks: 'outside',
          ticklen: 10,
          tickcolor: 'rgba(0,0,0,0)',
        },
        showlegend: false,
      }}
      exploreComponents={[DemographicApplicationDomainOther]}
      onExplore={onExplore}
    />
  );
};

export default DemographicApplicationDomain;
