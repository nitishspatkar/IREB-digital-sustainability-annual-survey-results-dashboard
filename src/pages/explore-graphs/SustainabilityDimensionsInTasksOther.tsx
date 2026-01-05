import { GenericChart } from '../../components/GraphViews';
import type { ChartProcessor } from '../../components/GraphViews';

const processor: ChartProcessor = (responses) => {
  const normalize = (v: string) => v?.trim().toLowerCase() ?? '';
  let otherCount = 0;
  const texts: string[] = [];

  // Filter for Q28 = Yes
  const filteredResponses = responses.filter(
    (r) => normalize(r.raw.personIncorporatesSustainability) === 'yes'
  );

  filteredResponses.forEach((response) => {
    const otherVal = normalize(response.raw.roleConsiderOther);
    if (otherVal.length > 0 && otherVal !== 'n/a') {
      otherCount++;
      texts.push(response.raw.roleConsiderOther?.trim() ?? '');
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

export const SustainabilityDimensionsInTasksOther = ({ onBack }: { onBack: () => void }) => {
  return (
    <GenericChart
      graphId="SustainabilityDimensionsInTasksDetails"
      processor={processor}
      isEmbedded={true}
      onBack={onBack}
    />
  );
};
