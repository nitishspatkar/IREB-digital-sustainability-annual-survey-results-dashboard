import { useMemo } from 'react';
import { useSurveyData } from '../../data/data-parsing-logic/SurveyContext';
import { useGraphDescription } from '../../hooks/useGraphDescription';
import { SurveyExploreList } from '../../components/GraphViews';

const normalizeFrequency = (value: string) => value.replace(/\s+/g, ' ').trim();

export const DiscussionFrequencyOther = ({ onBack }: { onBack: () => void }) => {
  const surveyResponses = useSurveyData();
  const { title, question, description } = useGraphDescription('DiscussionFrequencyDetails');

  const { frequencyStats, otherFrequencyTexts } = useMemo(() => {
    const counts = new Map<string, number>();
    const otherTexts: string[] = [];

    surveyResponses.forEach((response) => {
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

    const stats = Array.from(counts.entries())
      .map(([frequency, count]) => ({ frequency, count }))
      .sort((a, b) => a.count - b.count);

    return {
      frequencyStats: stats,
      otherFrequencyTexts: otherTexts,
    };
  }, [surveyResponses]);

  // Stats Logic for "Other"
  const numberOfResponsesOther = otherFrequencyTexts.length;
  const numberOfResponsesOtherAll = useMemo(() => {
    const otherStat = frequencyStats.find((s) => s.frequency.toLowerCase().includes('other'));
    return otherStat ? otherStat.count : 0;
  }, [frequencyStats]);

  const otherResponseRate =
    numberOfResponsesOtherAll > 0 ? (numberOfResponsesOther / numberOfResponsesOtherAll) * 100 : 0;

  if (otherFrequencyTexts.length === 0) {
    return null;
  }

  return (
    <SurveyExploreList
      title={title}
      items={otherFrequencyTexts}
      question={question}
      description={description}
      numberOfResponses={numberOfResponsesOther}
      responseRate={otherResponseRate}
      onBack={onBack}
    />
  );
};
