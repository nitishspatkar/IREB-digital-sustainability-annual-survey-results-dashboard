import { useMemo } from 'react';
import { useSurveyData } from '../../../data/data-parsing-logic/SurveyContext';
import { useGraphDescription } from '../../../hooks/useGraphDescription';
import { SurveyExploreList } from '../../../components/GraphViews';

const normalizeRole = (value: string) => value.replace(/\s+/g, ' ').trim();

export const DemographicOrganizationalRoleOther = ({ onBack }: { onBack: () => void }) => {
  const surveyResponses = useSurveyData();
  const { title, question, description } = useGraphDescription(
    'DemographicOrganizationalRoleDetails'
  );

  const { otherRoleTexts, numberOfResponsesOtherAll } = useMemo(() => {
    let otherCount = 0;
    const texts: string[] = [];

    surveyResponses.forEach((response) => {
      const role = normalizeRole(response.raw.role ?? '');
      if (role.toLowerCase() === 'other') {
        otherCount++;
        const otherText = normalizeRole(response.raw.roleOther ?? '');
        if (otherText.length > 0) {
          texts.push(otherText);
        }
      }
    });

    return { otherRoleTexts: texts, numberOfResponsesOtherAll: otherCount };
  }, [surveyResponses]);

  const numberOfResponsesOther = otherRoleTexts.length;
  const otherResponseRate =
    numberOfResponsesOtherAll > 0 ? (numberOfResponsesOther / numberOfResponsesOtherAll) * 100 : 0;

  return (
    <SurveyExploreList
      title={title}
      items={otherRoleTexts}
      question={question}
      description={description}
      numberOfResponses={numberOfResponsesOther}
      responseRate={otherResponseRate}
      onBack={onBack}
    />
  );
};
