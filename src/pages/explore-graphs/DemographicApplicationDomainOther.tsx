import { GenericChart } from '../../components/GraphViews';
import type { ChartProcessor } from '../../components/GraphViews';

const normalize = (val: string) => val.replace(/\s+/g, ' ').trim();

const processor: ChartProcessor = (responses) => {
  let otherCount = 0;
  const texts: string[] = [];

  responses.forEach((r) => {
    const domain = normalize(r.raw.primaryApplicationDomain ?? '');

    if (domain.toLowerCase() === 'other') {
      otherCount++;
      const otherText = normalize(r.raw.primaryApplicationDomainOther ?? '');
      if (otherText.length > 0) {
        texts.push(otherText);
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

export const DemographicApplicationDomainOther = ({ onBack }: { onBack: () => void }) => {
  return (
    <GenericChart
      graphId="DemographicApplicationDomainDetails"
      processor={processor}
      isEmbedded={true}
      onBack={onBack}
    />
  );
};
