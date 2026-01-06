import {
  GenericChart,
  type ChartProcessor,
  type DataExtractor,
} from '../../../components/GraphViews';
import {
  getTrainingReasonsStats,
  TrainingReasonsNoDetails,
} from '../../explore-graphs/TrainingReasonsNoDetails';
import { TrainingReasonsNoByAge } from '../../explore-graphs/TrainingReasonsNoByAge.tsx';
import { TrainingReasonsNoByExperience } from '../../explore-graphs/TrainingReasonsNoByExperience.tsx';
import { TrainingReasonsNoByRole } from '../../explore-graphs/TrainingReasonsNoByRole.tsx';
import { TrainingReasonsNoByRegion } from '../../explore-graphs/TrainingReasonsNoByRegion.tsx';
import {
  horizontalBarComparisonStrategy,
  type HorizontalBarData,
} from '../../../components/comparision-components/HorizontalBarComparisonStrategy';

// --- DATA EXTRACTOR ---
const trainingReasonsNoDataExtractor: DataExtractor<HorizontalBarData> = (responses) => {
  const { stats, respondentsWithAnyAnswer, totalEligible } = getTrainingReasonsStats(responses);

  return {
    items: stats.map((stat) => ({ label: stat.label, value: stat.count })),
    stats: {
      numberOfResponses: respondentsWithAnyAnswer,
      totalEligible: totalEligible,
    },
  };
};

// --- PROCESSOR ---
const processData: ChartProcessor = (responses, palette) => {
  const data = trainingReasonsNoDataExtractor(responses);
  const stats = data.items.map((item) => ({ label: item.label, count: item.value }));

  return {
    traces: [
      {
        type: 'bar',
        orientation: 'h',
        x: stats.map((s) => s.count),
        y: stats.map((s) => s.label),
        marker: { color: palette.berry },
        text: stats.map((s) => s.count.toString()),
        textposition: 'outside',
        textfont: { family: 'PP Mori, sans-serif', size: 12, color: palette.grey },
        cliponaxis: false,
        hoverinfo: 'none',
      },
    ],
    stats: data.stats,
  };
};

// --- COMPONENT 1: Main Chart (Dashboard) ---
export const TrainingReasonsNo = ({ onExplore }: { onExplore?: () => void }) => {
  return (
    <GenericChart
      graphId="TrainingReasonsNo"
      processor={processData}
      layout={{
        margin: { t: 60, r: 40, b: 60, l: 300 }, // Preserved large left margin for labels
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
      }}
      exploreComponents={[
        TrainingReasonsNoDetails,
        TrainingReasonsNoByRole,
        TrainingReasonsNoByRegion,
        TrainingReasonsNoByAge,
        TrainingReasonsNoByExperience,
      ]}
      onExplore={onExplore}
      dataExtractor={trainingReasonsNoDataExtractor}
      comparisonStrategy={horizontalBarComparisonStrategy}
    />
  );
};

export default TrainingReasonsNo;
