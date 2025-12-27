import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';

import { useSurveyData } from '../../../data/SurveyContext';
import useThemeColor from '../../../hooks/useThemeColor';
import { SurveyChart, SurveyExploreList } from '../../../components/GraphViews';
import { useGraphDescription } from '../../../hooks/useGraphDescription';

// --- SHARED DATA LOGIC ---
const useSustainabilityDimensionsInTasksData = () => {
  const responses = useSurveyData();
  const barColor = useThemeColor('--color-ireb-berry');
  const tickColor = useThemeColor('--color-ireb-grey-01');

  const { stats, roleOtherTexts, totalRespondentsWithAnswer, totalEligible } = useMemo(() => {
    const norm = (v: string) => v?.trim().toLowerCase() ?? '';

    let environmental = 0;
    let social = 0;
    let individual = 0;
    let economic = 0;
    let technical = 0;
    let other = 0;
    let numberOfRespondents = 0;

    // --- Precondition: Q28 = Yes ---
    const filteredResponses = responses.filter(
      (r) => norm(r.raw.personIncorporatesSustainability) === 'yes'
    );

    filteredResponses.forEach((r) => {
      const raw = r.raw;
      let hasAnswer = false;

      if (norm(raw.roleConsiderEnvironmental) === 'yes') {
        environmental += 1;
        hasAnswer = true;
      }
      if (norm(raw.roleConsiderSocial) === 'yes') {
        social += 1;
        hasAnswer = true;
      }
      if (norm(raw.roleConsiderIndividual) === 'yes') {
        individual += 1;
        hasAnswer = true;
      }
      if (norm(raw.roleConsiderEconomic) === 'yes') {
        economic += 1;
        hasAnswer = true;
      }
      if (norm(raw.roleConsiderTechnical) === 'yes') {
        technical += 1;
        hasAnswer = true;
      }

      if (
        norm(raw.roleConsiderEnvironmental) === 'no' &&
        norm(raw.roleConsiderSocial) === 'no' &&
        norm(raw.roleConsiderIndividual) === 'no' &&
        norm(raw.roleConsiderEconomic) === 'no' &&
        norm(raw.roleConsiderTechnical) === 'no'
      ) {
        hasAnswer = true;
      }

      const otherVal = norm(raw.roleConsiderOther);
      if (otherVal.length > 0 && otherVal !== 'n/a') {
        other += 1;
        hasAnswer = true;
      }

      if (hasAnswer) numberOfRespondents += 1;
    });

    const items = [
      { label: 'Environmental', value: environmental },
      { label: 'Social', value: social },
      { label: 'Individual', value: individual },
      { label: 'Economic', value: economic },
      { label: 'Technical', value: technical },
      { label: 'Other', value: other },
    ];

    // Sort ascending by value for horizontal chart
    items.sort((a, b) => a.value - b.value);

    // Extract texts
    const texts = responses
      .map((r) => (r.raw.roleConsiderOther ?? '').trim())
      .filter((value) => {
        if (!value) return false;
        const lower = value.toLowerCase();
        return lower.length > 0 && lower !== 'n/a';
      });

    return {
      stats: items,
      roleOtherTexts: texts,
      totalRespondentsWithAnswer: numberOfRespondents,
      totalEligible: filteredResponses.length,
    };
  }, [responses]);

  return {
    stats,
    roleOtherTexts,
    totalRespondentsWithAnswer,
    totalEligible,
    barColor,
    tickColor,
  };
};

// --- COMPONENT 1: Main Chart ---
export const SustainabilityDimensionsInTasks = ({
  onExplore,
  className,
}: {
  onExplore?: () => void;
  className?: string;
}) => {
  const { stats, roleOtherTexts, totalRespondentsWithAnswer, totalEligible, barColor, tickColor } =
    useSustainabilityDimensionsInTasksData();
  const { question, description } = useGraphDescription('SustainabilityDimensionsInTasks');

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
      margin: { t: 50, r: 40, b: 60, l: 120 }, // Preserved margin
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
      hasExploreData={roleOtherTexts.length > 0}
      onExplore={onExplore}
    />
  );
};

// --- COMPONENT 2: Detail List ---
export const SustainabilityDimensionsInTasksDetails = ({ onBack }: { onBack: () => void }) => {
  const { stats, roleOtherTexts } = useSustainabilityDimensionsInTasksData();
  const { question } = useGraphDescription('SustainabilityDimensionsInTasks');
  const { question: questionDetails, description: descriptionDetails } = useGraphDescription(
    'SustainabilityDimensionsInTasksDetails'
  );

  // Calculate rate relative to "Other" checkbox selection
  const otherStat = stats.find((s) => s.label === 'Other');
  const numberOfOtherSelections = otherStat ? otherStat.value : 0;

  const responseRate =
    numberOfOtherSelections > 0 ? (roleOtherTexts.length / numberOfOtherSelections) * 100 : 0;

  return (
    <SurveyExploreList
      title={question}
      items={roleOtherTexts}
      question={questionDetails}
      description={descriptionDetails}
      numberOfResponses={roleOtherTexts.length}
      responseRate={responseRate}
      onBack={onBack}
    />
  );
};

export default SustainabilityDimensionsInTasks;
