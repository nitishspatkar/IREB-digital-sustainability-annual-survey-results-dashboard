import { GenericChart } from '../../components/GraphViews';
import type { ChartProcessor } from '../../components/GraphViews';

const processor: ChartProcessor = (responses) => {
  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // Precondition: Q10 = Yes
  const filteredResponses = responses.filter((r) => norm(r.raw.participatedInTraining) === 'yes');

  let countOther = 0;
  const texts: string[] = [];

  filteredResponses.forEach((r) => {
    const oVal = norm(r.raw.notMoreTrainingOther);
    if (oVal.length > 0 && oVal !== 'n/a') {
      countOther++;
      texts.push(r.raw.notMoreTrainingOther?.trim() ?? '');
    }
  });

  return {
    items: texts,
    stats: {
      numberOfResponses: texts.length,
      totalEligible: countOther,
    },
  };
};

export const TrainingReasonsNotMoreOther = ({ onBack }: { onBack: () => void }) => {
  return (
    <GenericChart
      graphId="TrainingReasonsNotMoreDetails"
      processor={processor}
      isEmbedded={true}
      onBack={onBack}
    />
  );
};
