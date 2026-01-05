import { GenericChart } from '../../components/GraphViews';
import type { ChartProcessor } from '../../components/GraphViews';

const processor: ChartProcessor = (responses) => {
  const normalize = (v: string) => v?.trim().toLowerCase() ?? '';
  let otherCount = 0;
  const texts: string[] = [];

  responses.forEach((response) => {
    const otherVal = normalize(response.raw.lackKnowledgeOther);
    if (otherVal.length > 0 && otherVal !== 'n/a') {
      otherCount++;
      texts.push(response.raw.lackKnowledgeOther?.trim() ?? '');
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

export const KnowledgeGapsByDimensionOther = ({ onBack }: { onBack: () => void }) => {
  return (
    <GenericChart
      graphId="KnowledgeGapsByDimensionDetails"
      processor={processor}
      isEmbedded={true}
      onBack={onBack}
    />
  );
};
