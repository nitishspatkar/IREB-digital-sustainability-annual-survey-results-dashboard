import { useMemo } from 'react';
import { useSurveyData } from '../../data/data-parsing-logic/SurveyContext';
import { useGraphDescription } from '../../hooks/useGraphDescription';
import { SurveyExploreList } from '../../components/GraphViews';

const normalize = (val: string) => val.replace(/\s+/g, ' ').trim();

export const DemographicApplicationDomainOther = ({ onBack }: { onBack: () => void }) => {
  const surveyResponses = useSurveyData();
  const { title, question, description } = useGraphDescription(
    'DemographicApplicationDomainDetails'
  );

  const { otherTexts, totalOtherCategory } = useMemo(() => {
    let otherCount = 0;
    const texts: string[] = [];

    surveyResponses.forEach((r) => {
      const domain = normalize(r.raw.primaryApplicationDomain ?? '');

      if (domain.toLowerCase() === 'other') {
        otherCount++;
        const otherText = normalize(r.raw.primaryApplicationDomainOther ?? '');
        if (otherText.length > 0) {
          texts.push(otherText);
        }
      }
    });

    return { otherTexts: texts, totalOtherCategory: otherCount };
  }, [surveyResponses]);

  const numOther = otherTexts.length;
  const rate = totalOtherCategory > 0 ? (numOther / totalOtherCategory) * 100 : 0;

  return (
    <SurveyExploreList
      title={title}
      items={otherTexts}
      question={question}
      description={description}
      numberOfResponses={numOther}
      responseRate={rate}
      onBack={onBack}
    />
  );
};
