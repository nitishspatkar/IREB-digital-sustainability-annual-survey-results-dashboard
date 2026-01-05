import { GenericChart } from '../../../components/GraphViews';
import type { ChartProcessor } from '../../../components/GraphViews';
import {
  getTrainingReasonsStats,
  TrainingReasonsNoDetails,
} from '../../explore-graphs/TrainingReasonsNoDetails';
import { TrainingReasonsNoByAge } from '../../explore-graphs/TrainingReasonsNoByAge.tsx';
import { TrainingReasonsNoByExperience } from '../../explore-graphs/TrainingReasonsNoByExperience.tsx';
import { TrainingReasonsNoByRole } from '../../explore-graphs/TrainingReasonsNoByRole.tsx';

// --- PROCESSOR ---
const processData: ChartProcessor = (responses, palette) => {
  const { stats, respondentsWithAnyAnswer, totalEligible } = getTrainingReasonsStats(responses);

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
    stats: {
      numberOfResponses: respondentsWithAnyAnswer,
      totalEligible: totalEligible,
    },
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
        TrainingReasonsNoByAge,
        TrainingReasonsNoByExperience,
      ]}
      onExplore={onExplore}
    />
  );
};

export default TrainingReasonsNo;
