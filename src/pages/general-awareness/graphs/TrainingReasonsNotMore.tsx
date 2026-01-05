import { GenericChart } from '../../../components/GraphViews';
import type { ChartProcessor } from '../../../components/GraphViews';
import { TrainingReasonsNotMoreOther } from '../../explore-graphs/TrainingReasonsNotMoreOther';

const processData: ChartProcessor = (responses, palette) => {
  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // Precondition: Q10 = Yes
  const filteredResponses = responses.filter((r) => norm(r.raw.participatedInTraining) === 'yes');

  let countAware = 0,
    countNoOffer = 0,
    countNoOpp = 0,
    countNoNeed = 0,
    countExpensive = 0,
    countOther = 0;
  let withAnswer = 0;

  filteredResponses.forEach((r) => {
    const raw = r.raw;
    let hasAnswer = false;

    if (norm(raw.notMoreTrainingNotAware) === 'yes') {
      countAware++;
      hasAnswer = true;
    }
    if (norm(raw.notMoreTrainingNoOrganization) === 'yes') {
      countNoOffer++;
      hasAnswer = true;
    }
    if (norm(raw.notMoreTrainingNoOpportunity) === 'yes') {
      countNoOpp++;
      hasAnswer = true;
    }
    if (norm(raw.notMoreTrainingNoNeed) === 'yes') {
      countNoNeed++;
      hasAnswer = true;
    }
    if (norm(raw.notMoreTrainingTooExpensive) === 'yes') {
      countExpensive++;
      hasAnswer = true;
    }

    // Exakte Kopie der Logik aus TrainingReasonsNo
    if (
      norm(raw.notMoreTrainingNotAware) === 'no' &&
      norm(raw.notMoreTrainingNoOrganization) === 'no' &&
      norm(raw.notMoreTrainingNoOpportunity) === 'no' &&
      norm(raw.notMoreTrainingNoNeed) === 'no' &&
      norm(raw.notMoreTrainingTooExpensive) === 'no'
    ) {
      hasAnswer = true;
    }

    const oVal = norm(raw.notMoreTrainingOther);
    if (oVal.length > 0 && oVal !== 'n/a') {
      countOther++;
      hasAnswer = true;
    }

    if (hasAnswer) withAnswer++;
  });

  const items = [
    {
      label: 'I was not aware such programs existed',
      key: 'notMoreTrainingNotAware',
      count: countAware,
    },
    {
      label: 'My organization does not offer such programs',
      key: 'notMoreTrainingNoOrganization',
      count: countNoOffer,
    },
    {
      label: 'I have not had the opportunity to attend',
      key: 'notMoreTrainingNoOpportunity',
      count: countNoOpp,
    },
    {
      label: "I don't see the need for such training",
      key: 'notMoreTrainingNoNeed',
      count: countNoNeed,
    },
    { label: 'The cost is too high', key: 'notMoreTrainingTooExpensive', count: countExpensive },
    { label: 'Other', key: 'notMoreTrainingOther', count: countOther },
  ].sort((a, b) => a.count - b.count);

  return {
    traces: [
      {
        type: 'bar',
        orientation: 'h',
        x: items.map((s) => s.count),
        y: items.map((s) => s.label),
        marker: { color: palette.berry },
        text: items.map((s) => s.count.toString()),
        textposition: 'outside',
        textfont: { family: 'PP Mori, sans-serif', size: 12, color: palette.grey },
        cliponaxis: false,
        hoverinfo: 'none',
      },
    ],
    stats: {
      numberOfResponses: withAnswer,
      totalEligible: filteredResponses.length,
    },
  };
};

export const TrainingReasonsNotMore = ({ onExplore }: { onExplore?: () => void }) => {
  return (
    <GenericChart
      graphId="TrainingReasonsNotMore"
      processor={processData}
      layout={{
        margin: { t: 60, r: 40, b: 60, l: 300 },
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
      exploreComponents={[TrainingReasonsNotMoreOther]}
      onExplore={onExplore}
    />
  );
};

export default TrainingReasonsNotMore;
