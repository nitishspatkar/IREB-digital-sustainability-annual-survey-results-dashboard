import { useMemo } from 'react';
import { useSurveyData } from '../../data/data-parsing-logic/SurveyContext';
import { useGraphDescription } from '../../hooks/useGraphDescription';
import { SurveyExploreList } from '../../components/GraphViews';

export const AdditionalSupportResourcesOther = ({ onBack }: { onBack: () => void }) => {
  const responses = useSurveyData();
  const { question: mainQuestion } = useGraphDescription('AdditionalSupportResources');
  const { question, description } = useGraphDescription('AdditionalSupportResourcesDetails');

  const { otherTexts, numberOfOtherSelections } = useMemo(() => {
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
      otherTexts: texts,
      numberOfOtherSelections: otherCount,
    };
  }, [responses]);

  const responseRate =
    numberOfOtherSelections > 0 ? (otherTexts.length / numberOfOtherSelections) * 100 : 0;

  return (
    <SurveyExploreList
      title={mainQuestion}
      items={otherTexts}
      question={question}
      description={description}
      numberOfResponses={otherTexts.length}
      responseRate={responseRate}
      onBack={onBack}
    />
  );
};
