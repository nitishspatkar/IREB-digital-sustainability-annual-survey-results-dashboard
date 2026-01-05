import { GenericChart } from '../../components/GraphViews';
import type { ChartProcessor } from '../../components/GraphViews';

const processor: ChartProcessor = (responses) => {
  const normalize = (v: string) => v?.trim().toLowerCase() ?? '';
  let otherCount = 0;
  const texts: string[] = [];

  responses.forEach((response) => {
    const otherVal = normalize(response.raw.orgNoTrainingOther);
    if (otherVal.length > 0 && otherVal !== 'n/a') {
      otherCount++;
      texts.push(response.raw.orgNoTrainingOther?.trim() ?? '');
    }
  });

  return {
    items: texts,
    stats: {
      numberOfResponses: texts.length,
      totalEligible: otherCount,
    },
  };
};

export const NoTrainingReasonsOther = ({ onBack }: { onBack: () => void }) => {
  return (
    <GenericChart
      graphId="NoTrainingReasonsDetails"
      processor={processor}
      isEmbedded={true}
      onBack={onBack}
    />
  );
};
