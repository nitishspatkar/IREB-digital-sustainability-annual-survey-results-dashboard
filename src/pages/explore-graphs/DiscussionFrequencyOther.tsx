import { GenericChart } from '../../components/GraphViews';
import type { ChartProcessor } from '../../components/GraphViews';

const normalizeFrequency = (value: string) => value.replace(/\s+/g, ' ').trim();

const processor: ChartProcessor = (responses) => {
  const counts = new Map<string, number>();
  const otherTexts: string[] = [];

  responses.forEach((response) => {
    const frequency = normalizeFrequency(response.raw.discussionFrequency ?? '');
    if (frequency.length > 0 && frequency.toLowerCase() !== 'n/a') {
      counts.set(frequency, (counts.get(frequency) ?? 0) + 1);
    }

    if (frequency.toLowerCase() === 'other') {
      const otherText = normalizeFrequency(response.raw.discussionFrequencyOther ?? '');
      if (otherText.length > 0) {
        otherTexts.push(otherText);
      }
    }
  });

  // If no "other" texts exist, return null to prevent rendering
  if (otherTexts.length === 0) {
    return null;
  }

  const otherStat = Array.from(counts.entries()).find(([freq]) =>
    freq.toLowerCase().includes('other')
  );
  const totalEligible = otherStat ? otherStat[1] : 0;

  return {
    items: otherTexts,
    stats: {
      numberOfResponses: otherTexts.length,
      totalEligible: totalEligible,
    },
  };
};

export const DiscussionFrequencyOther = ({ onBack }: { onBack: () => void }) => {
  return (
    <GenericChart
      graphId="DiscussionFrequencyDetails"
      processor={processor}
      isEmbedded={true}
      onBack={onBack}
    />
  );
};
