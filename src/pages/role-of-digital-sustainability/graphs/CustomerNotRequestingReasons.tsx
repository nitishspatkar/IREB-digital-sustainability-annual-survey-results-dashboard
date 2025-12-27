import { useMemo } from 'react';
import { useSurveyData } from '../../../data/SurveyContext';
import useThemeColor from '../../../hooks/useThemeColor';
import { columnDefinitions } from '../../../data/SurveyColumnDefinitions.ts';
import GraphWrapper from '../../../components/GraphWrapper';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

const CustomerNotRequestingReasons = () => {
  const questionHeader = columnDefinitions.find(
    (c) => c.key === 'customerNotRequestingReasons'
  )?.header;
  const tickColor = useThemeColor('--color-ireb-grey-01');
  const borderColor = useThemeColor('--color-ireb-grey-01');

  const responses = useSurveyData();

  const reasons = useMemo<string[]>(() => {
    // Precondition: Q26 = "Rarely..." or "Never"
    const rarely = 'rarely, but it has happened';
    const never = 'never';

    const filteredResponses = responses.filter((r) => {
      const freq = normalize(r.raw.customerRequirementFrequency ?? '').toLowerCase();
      return freq === rarely || freq === never;
    });

    // 2. Get their descriptions from Q27
    return filteredResponses
      .map((r) => normalize(r.raw.customerNotRequestingReasons ?? ''))
      .filter(
        (reason) => reason.length > 0 && reason.toLowerCase() !== 'n/a' // Remove empty/n.a.
      );
  }, [responses]);

  const filteredTotal = responses.filter((r) => {
    const freq = normalize(r.raw.customerRequirementFrequency ?? '').toLowerCase();
    return freq === 'rarely, but it has happened' || freq === 'never';
  }).length;
  const responseRate = filteredTotal > 0 ? (reasons.length / filteredTotal) * 100 : 0;

  const question = questionHeader ?? 'Why do customers not request sustainable digital solutions?';
  const description =
    "Open-text responses from those who selected 'Rarely' or 'Never' for customer requirements.";

  return (
    <GraphWrapper
      question={question}
      description={description}
      numberOfResponses={reasons.length}
      responseRate={responseRate}
    >
      <div className="h-[520px]">
        {reasons.length === 0 ? (
          <div className="flex h-full items-center justify-center" style={{ color: tickColor }}>
            No reasons provided.
          </div>
        ) : (
          <ul className="h-full overflow-y-auto" style={{ color: tickColor }}>
            {reasons.map((reason, index) => (
              <li
                key={index}
                className="border-b px-2 py-3 text-sm"
                style={{ borderColor: borderColor }}
              >
                {reason}
              </li>
            ))}
          </ul>
        )}
      </div>
    </GraphWrapper>
  );
};

export default CustomerNotRequestingReasons;
