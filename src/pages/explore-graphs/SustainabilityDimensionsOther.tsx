import { useMemo } from 'react';
import { useSurveyData } from '../../data/data-parsing-logic/SurveyContext';
import { useGraphDescription } from '../../hooks/useGraphDescription';
import { SurveyExploreList } from '../../components/GraphViews';

export const SustainabilityDimensionsOther = ({ onBack }: { onBack: () => void }) => {
  const surveyResponses = useSurveyData();
  const { question: mainQuestion } = useGraphDescription('SustainabilityDimensions');
  const { question: questionDetails, description: descriptionDetails } = useGraphDescription(
    'SustainabilityDimensionsDetails'
  );

  const { otherTexts, numberOfOtherSelections } = useMemo(() => {
    const normalize = (v: string) => v?.trim().toLowerCase() ?? '';
    let otherCount = 0;
    const texts: string[] = [];

    surveyResponses.forEach((response) => {
      const otherVal = normalize(response.raw.considerOther);
      if (otherVal.length > 0 && otherVal !== 'n/a') {
        otherCount++;
        texts.push(response.raw.considerOther?.trim() ?? '');
      }
    });

    return { otherTexts: texts, numberOfOtherSelections: otherCount };
  }, [surveyResponses]);

  const responseRate =
    numberOfOtherSelections > 0 ? (otherTexts.length / numberOfOtherSelections) * 100 : 0;

  return (
    <SurveyExploreList
      title={mainQuestion}
      items={otherTexts}
      question={questionDetails}
      description={descriptionDetails}
      numberOfResponses={otherTexts.length}
      responseRate={responseRate}
      onBack={onBack}
    />
  );
};
