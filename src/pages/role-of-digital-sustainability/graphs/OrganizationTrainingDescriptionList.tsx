import { useMemo } from 'react';
import { useSurveyData } from '../../../data/data-parsing-logic/SurveyContext';
import useThemeColor from '../../../hooks/useThemeColor';
import GraphWrapper from '../../../components/GraphWrapper';
import { useGraphDescription } from '../../../hooks/useGraphDescription';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

const OrganizationTrainingDescriptionList = () => {
  const { question, description } = useGraphDescription('OrganizationTrainingDescriptionList');
  const tickColor = useThemeColor('--color-ireb-grey-01');
  const borderColor = useThemeColor('--color-ireb-grey-01');

  const responses = useSurveyData();

  const descriptions = useMemo<string[]>(() => {
    // --- Precondition: Q23 = Yes ---
    const filteredResponses = responses.filter(
      (r) => normalize(r.raw.organizationOffersTraining ?? '').toLowerCase() === 'yes'
    );

    // 2. Get their descriptions from Q24
    return filteredResponses
      .map((r) => normalize(r.raw.organizationTrainingDescription ?? ''))
      .filter(
        (desc) => desc.length > 0 && desc.toLowerCase() !== 'n/a' // Remove empty/n.a.
      );
  }, [responses]);

  const filteredTotal = responses.filter(
    (r) => normalize(r.raw.organizationOffersTraining ?? '').toLowerCase() === 'yes'
  ).length;
  const responseRate = filteredTotal > 0 ? (descriptions.length / filteredTotal) * 100 : 0;

  return (
    <GraphWrapper
      question={question}
      description={description}
      numberOfResponses={descriptions.length}
      responseRate={responseRate}
    >
      <div className="h-[520px]">
        {descriptions.length === 0 ? (
          <div className="flex h-full items-center justify-center" style={{ color: tickColor }}>
            No descriptions provided.
          </div>
        ) : (
          <ul className="h-full overflow-y-auto" style={{ color: tickColor }}>
            {descriptions.map((desc, index) => (
              <li
                key={index}
                className="border-b px-2 py-3 text-sm"
                style={{ borderColor: borderColor }}
              >
                {desc}
              </li>
            ))}
          </ul>
        )}
      </div>
    </GraphWrapper>
  );
};

export default OrganizationTrainingDescriptionList;
