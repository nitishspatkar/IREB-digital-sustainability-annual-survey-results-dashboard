import { useMemo } from 'react';
import { useSurveyData } from '../../data/data-parsing-logic/SurveyContext';
import { useGraphDescription } from '../../hooks/useGraphDescription';
import { SurveyExploreList } from '../../components/GraphViews';

export const HindrancesToIncorporateSustainabilityOther = ({ onBack }: { onBack: () => void }) => {
  const surveyResponses = useSurveyData();
  const { question: mainQuestion } = useGraphDescription('HindrancesToIncorporateSustainability');
  const { question: questionDetails, description: descriptionDetails } = useGraphDescription(
    'HindrancesToIncorporateSustainabilityDetails'
  );

  const { otherTexts, numberOfOtherSelections } = useMemo(() => {
    const normalize = (v: string) => v?.trim().toLowerCase() ?? '';
    let otherCount = 0;
    const texts: string[] = [];

    // Filter for Q28 = No
    const filteredResponses = surveyResponses.filter(
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
