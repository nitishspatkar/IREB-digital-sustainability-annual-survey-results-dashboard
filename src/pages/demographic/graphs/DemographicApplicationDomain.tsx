import { GenericChart } from '../../../components/GraphViews';
import type { ChartProcessor, DataExtractor } from '../../../components/GraphViews';
import { DemographicApplicationDomainOther } from '../../explore-graphs/DemographicApplicationDomainOther';
import { type HorizontalBarData } from '../../../components/comparision-components/HorizontalBarComparisonStrategy';
import { scatterPlotComparisonStrategy } from '../../../components/comparision-components/ScatterPlotComparisonStrategy';

const normalize = (val: string) => val.replace(/\s+/g, ' ').trim();

// --- DATA EXTRACTOR ---
const applicationDomainDataExtractor: DataExtractor<HorizontalBarData> = (responses) => {
  const counts = new Map<string, number>();

  responses.forEach((r) => {
    const val = normalize(r.raw.primaryApplicationDomain ?? '');
    if (val && val.toLowerCase() !== 'n/a') {
      counts.set(val, (counts.get(val) ?? 0) + 1);
    }
  });

  const items = Array.from(counts.entries()).map(([label, value]) => ({ label, value }));
  const numResp = items.reduce((sum, item) => sum + item.value, 0);

  return {
    items,
    stats: {
      numberOfResponses: numResp,
    },
  };
};

const processData: ChartProcessor = (responses, palette) => {
  const data = applicationDomainDataExtractor(responses);

  // Sort descending by count (reversed for display)
  const stats = [...data.items]
    .map(({ label, value }) => ({ domain: label, count: value }))
    .sort((a, b) => b.count - a.count);

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
    stats: data.stats,
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
      dataExtractor={applicationDomainDataExtractor}
      comparisonStrategy={scatterPlotComparisonStrategy}
    />
  );
};

export default DemographicApplicationDomain;
