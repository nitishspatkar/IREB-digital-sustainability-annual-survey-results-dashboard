import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';

import { useSurveyData } from '../../../data/data-parsing-logic/SurveyContext';
import useThemeColor from '../../../hooks/useThemeColor';
import { SurveyChart, SurveyExploreList } from '../../../components/GraphViews';
import { useGraphDescription } from '../../../hooks/useGraphDescription';

// --- SHARED DATA LOGIC ---
const useSupportResourcesData = () => {
  const responses = useSurveyData();
  const barColor = useThemeColor('--color-ireb-berry');
  const tickColor = useThemeColor('--color-ireb-grey-01');

  const { stats, otherTexts, totalRespondentsWithAnswer, totalEligible } = useMemo(() => {
    const norm = (v: string) => v?.trim().toLowerCase() ?? '';

    let theoretical = 0;
    let tutorials = 0;
    let curricula = 0;
    let practical = 0;
    let caseStudies = 0;
    let structures = 0;
    let tools = 0;
    let none = 0;
    let other = 0;
    let numberOfRespondents = 0;

    responses.forEach((r) => {
      const raw = r.raw;
      let hasAnswer = false;

      if (norm(raw.supportNeedTheoretical) === 'yes') {
        theoretical += 1;
        hasAnswer = true;
      }
      if (norm(raw.supportNeedTutorials) === 'yes') {
        tutorials += 1;
        hasAnswer = true;
      }
      if (norm(raw.supportNeedCurricula) === 'yes') {
        curricula += 1;
        hasAnswer = true;
      }
      if (norm(raw.supportNeedPractical) === 'yes') {
        practical += 1;
        hasAnswer = true;
      }
      if (norm(raw.supportNeedCaseStudies) === 'yes') {
        caseStudies += 1;
        hasAnswer = true;
      }
      if (norm(raw.supportNeedStructures) === 'yes') {
        structures += 1;
        hasAnswer = true;
      }
      if (norm(raw.supportNeedTools) === 'yes') {
        tools += 1;
        hasAnswer = true;
      }
      if (norm(raw.supportNeedNone) === 'yes') {
        none += 1;
        hasAnswer = true;
      }

      if (
        norm(raw.supportNeedTheoretical) === 'no' &&
        norm(raw.supportNeedTutorials) === 'no' &&
        norm(raw.supportNeedCurricula) === 'no' &&
        norm(raw.supportNeedPractical) === 'no' &&
        norm(raw.supportNeedCaseStudies) === 'no' &&
        norm(raw.supportNeedStructures) === 'no' &&
        norm(raw.supportNeedTools) === 'no' &&
        norm(raw.supportNeedNone) === 'no'
      ) {
        hasAnswer = true;
      }

      const otherVal = norm(raw.supportNeedOther);
      if (otherVal.length > 0 && otherVal !== 'n/a') {
        other += 1;
        hasAnswer = true;
      }

      if (hasAnswer) numberOfRespondents += 1;
    });

    const items = [
      { label: 'Theoretical knowledge (self-study)', value: theoretical },
      { label: 'Tutorials (training)', value: tutorials },
      { label: 'Curricula (programs)', value: curricula },
      { label: "Practical knowledge (how-to's)", value: practical },
      { label: 'Positive case studies', value: caseStudies },
      { label: 'Structures (frameworks/standards)', value: structures },
      { label: 'Tools (checklists/methods)', value: tools },
      { label: 'No additional support needed', value: none },
      { label: 'Other', value: other },
    ];

    // Sort ascending by value
    items.sort((a, b) => a.value - b.value);

    // Extract texts
    const texts = responses
      .map((r) => (r.raw.supportNeedOther ?? '').trim())
      .filter((value) => {
        if (!value) return false;
        const lower = value.toLowerCase();
        return lower.length > 0 && lower !== 'n/a';
      });

    return {
      stats: items,
      otherTexts: texts,
      totalRespondentsWithAnswer: numberOfRespondents,
      totalEligible: responses.length,
    };
  }, [responses]);

  return {
    stats,
    otherTexts,
    totalRespondentsWithAnswer,
    totalEligible,
    barColor,
    tickColor,
  };
};

// --- COMPONENT 1: Main Chart ---
export const AdditionalSupportResources = ({
  onExplore,
  className,
}: {
  onExplore?: () => void;
  className?: string;
}) => {
  const { stats, otherTexts, totalRespondentsWithAnswer, totalEligible, barColor, tickColor } =
    useSupportResourcesData();
  const { question, description } = useGraphDescription('AdditionalSupportResources');

  const data = useMemo<Data[]>(
    () => [
      {
        type: 'bar',
        orientation: 'h',
        x: stats.map((i) => i.value),
        y: stats.map((i) => i.label),
        marker: { color: barColor },
        text: stats.map((i) => i.value.toString()),
        textposition: 'outside',
        textfont: {
          family: 'PP Mori, sans-serif',
          size: 12,
          color: tickColor,
        },
        cliponaxis: false,
        hoverinfo: 'none',
      },
    ],
    [stats, barColor, tickColor]
  );

  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 50, r: 40, b: 60, l: 250 }, // Preserved specific margin
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      xaxis: {
        title: {
          text: 'Number of Respondents',
          font: { family: 'PP Mori, sans-serif', size: 12, color: tickColor },
        },
        tickfont: { family: 'PP Mori, sans-serif', size: 12, color: tickColor },
      },
      yaxis: {
        tickfont: {
          family: 'PP Mori, sans-serif',
          size: 12,
          color: tickColor,
        },
        automargin: true,
        ticks: 'outside',
        ticklen: 10,
        tickcolor: 'rgba(0,0,0,0)',
      },
    }),
    [tickColor]
  );

  const responseRate = totalEligible > 0 ? (totalRespondentsWithAnswer / totalEligible) * 100 : 0;

  return (
    <SurveyChart
      className={className}
      question={question}
      description={description}
      numberOfResponses={totalRespondentsWithAnswer}
      responseRate={responseRate}
      data={data}
      layout={layout}
      hasExploreData={otherTexts.length > 0}
      onExplore={onExplore}
    />
  );
};

// --- COMPONENT 2: Detail List ---
export const AdditionalSupportResourcesDetails = ({ onBack }: { onBack: () => void }) => {
  const { stats, otherTexts } = useSupportResourcesData();
  const { question } = useGraphDescription('AdditionalSupportResources');
  const { question: questionDetails, description: descriptionDetails } = useGraphDescription(
    'AdditionalSupportResourcesDetails'
  );

  // Calculate rate relative to "Other" checkbox selection
  const otherStat = stats.find((s) => s.label === 'Other');
  const numberOfOtherSelections = otherStat ? otherStat.value : 0;

  const responseRate =
    numberOfOtherSelections > 0 ? (otherTexts.length / numberOfOtherSelections) * 100 : 0;

  return (
    <SurveyExploreList
      title={question}
      items={otherTexts}
      question={questionDetails}
      description={descriptionDetails}
      numberOfResponses={otherTexts.length}
      responseRate={responseRate}
      onBack={onBack}
    />
  );
};

export default AdditionalSupportResources;
