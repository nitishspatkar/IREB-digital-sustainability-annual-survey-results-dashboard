import { GenericChart } from '../../components/GraphViews';
import type { ChartProcessor } from '../../components/GraphViews';

const processor: ChartProcessor = (responses) => {
  const normalize = (v: string) => v?.trim().toLowerCase() ?? '';
  let otherCount = 0;
  const texts: string[] = [];

  // Filter for Q28 = No
  const filteredResponses = responses.filter(
    (r) => normalize(r.raw.personIncorporatesSustainability) === 'no'
  );

  filteredResponses.forEach((response) => {
    const otherVal = normalize(response.raw.hindranceOther);
    // Check if "Other" was selected (sometimes it's just 'yes' if it's a checkbox, or text)
    // Based on previous logic: if (otherVal === 'yes' || (otherVal.length > 0 && otherVal !== 'n/a'))
    if (otherVal === 'yes' || (otherVal.length > 0 && otherVal !== 'n/a')) {
      otherCount++;
      // Only add text if it's not just 'yes' or 'n/a'
      if (otherVal !== 'yes' && otherVal !== 'n/a') {
        texts.push(response.raw.hindranceOther?.trim() ?? '');
      }
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

export const HindrancesToIncorporateSustainabilityOther = ({ onBack }: { onBack: () => void }) => {
  return (
    <GenericChart
      graphId="HindrancesToIncorporateSustainabilityDetails"
      processor={processor}
      isEmbedded={true}
      onBack={onBack}
    />
  );
};
