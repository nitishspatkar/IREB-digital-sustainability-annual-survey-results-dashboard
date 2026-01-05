import { GenericChart } from '../../components/GraphViews';
import type { ChartProcessor } from '../../components/GraphViews';

const processor: ChartProcessor = (responses) => {
  const norm = (v: string) => v?.trim().toLowerCase() ?? '';
  let otherCount = 0;

  const texts = responses
    .map((r) => (r.raw.supportNeedOther ?? '').trim())
    .filter((value) => {
      if (!value) return false;
      const lower = value.toLowerCase();
      return lower.length > 0 && lower !== 'n/a';
    });

  responses.forEach((r) => {
    const otherVal = norm(r.raw.supportNeedOther);
    if (otherVal.length > 0 && otherVal !== 'n/a') {
      otherCount += 1;
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

export const AdditionalSupportResourcesOther = ({ onBack }: { onBack: () => void }) => {
  return (
    <GenericChart
      graphId="AdditionalSupportResourcesDetails"
      processor={processor}
      isEmbedded={true}
      onBack={onBack}
    />
  );
};
