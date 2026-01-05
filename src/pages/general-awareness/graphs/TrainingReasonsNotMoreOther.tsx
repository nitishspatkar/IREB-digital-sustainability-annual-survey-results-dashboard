import { useMemo } from 'react';
import { useSurveyData } from '../../../data/data-parsing-logic/SurveyContext';
import { useGraphDescription } from '../../../hooks/useGraphDescription';
import { SurveyExploreList } from '../../../components/GraphViews';

export const TrainingReasonsNotMoreOther = ({ onBack }: { onBack: () => void }) => {
  const responses = useSurveyData();
  const { question: mainQuestion } = useGraphDescription('TrainingReasonsNotMore');
  const { question: questionDetails, description: descriptionDetails } = useGraphDescription(
    'TrainingReasonsNotMoreDetails'
  );

  const { otherTexts, numberOfOtherSelections } = useMemo(() => {
    const norm = (v: string) => v?.trim().toLowerCase() ?? '';

    // Precondition: Q10 = Yes
    const filteredResponses = responses.filter((r) => norm(r.raw.participatedInTraining) === 'yes');

    let countOther = 0;
    const texts: string[] = [];

    filteredResponses.forEach((r) => {
      const oVal = norm(r.raw.notMoreTrainingOther);
      if (oVal.length > 0 && oVal !== 'n/a') {
        countOther++;
        texts.push(r.raw.notMoreTrainingOther?.trim() ?? '');
      }
    });

    return { otherTexts: texts, numberOfOtherSelections: countOther };
  }, [responses]);

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
