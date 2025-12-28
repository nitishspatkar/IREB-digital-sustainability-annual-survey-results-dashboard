import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';

import { useSurveyData } from '../../../data/data-parsing-logic/SurveyContext';
import useThemeColor from '../../../hooks/useThemeColor';
import { SurveyChart, SurveyExploreList } from '../../../components/GraphViews';
import { useGraphDescription } from '../../../hooks/useGraphDescription';

// --- SHARED DATA LOGIC ---
const useHindrancesData = () => {
  const responses = useSurveyData();
  const barColor = useThemeColor('--color-ireb-berry');
  const tickColor = useThemeColor('--color-ireb-grey-01');

  const { stats, hindranceOtherTexts, totalRespondentsWithAnswer, totalEligible } = useMemo(() => {
    const norm = (v: string) => v?.trim().toLowerCase() ?? '';

    let lackInterest = 0;
    let lackKnowledge = 0;
    let limitedResources = 0;
    let financialConstraints = 0;
    let insufficientTime = 0;
    let lackSupport = 0;
    let complexity = 0;
    let culturalBarriers = 0;
    let stakeholderResistance = 0;
    let other = 0;
    let numberOfRespondents = 0;

    // --- Precondition: Q28 = No ---
    const filteredResponses = responses.filter(
      (r) => norm(r.raw.personIncorporatesSustainability) === 'no'
    );

    filteredResponses.forEach((r) => {
      const raw = r.raw;
      let hasAnswer = false;

      if (norm(raw.hindranceLackInterest) === 'yes') {
        lackInterest += 1;
        hasAnswer = true;
      }
      if (norm(raw.hindranceLackKnowledge) === 'yes') {
        lackKnowledge += 1;
        hasAnswer = true;
      }
      if (norm(raw.hindranceLimitedResources) === 'yes') {
        limitedResources += 1;
        hasAnswer = true;
      }
      if (norm(raw.hindranceFinancialConstraints) === 'yes') {
        financialConstraints += 1;
        hasAnswer = true;
      }
      if (norm(raw.hindranceInsufficientTime) === 'yes') {
        insufficientTime += 1;
        hasAnswer = true;
      }
      if (norm(raw.hindranceLackSupport) === 'yes') {
        lackSupport += 1;
        hasAnswer = true;
      }
      if (norm(raw.hindranceComplexity) === 'yes') {
        complexity += 1;
        hasAnswer = true;
      }
      if (norm(raw.hindranceCulturalBarriers) === 'yes') {
        culturalBarriers += 1;
        hasAnswer = true;
      }
      if (norm(raw.hindranceStakeholderResistance) === 'yes') {
        stakeholderResistance += 1;
        hasAnswer = true;
      }

      if (
        norm(raw.hindranceLackInterest) === 'no' &&
        norm(raw.hindranceLackKnowledge) === 'no' &&
        norm(raw.hindranceLimitedResources) === 'no' &&
        norm(raw.hindranceFinancialConstraints) === 'no' &&
        norm(raw.hindranceInsufficientTime) === 'no' &&
        norm(raw.hindranceLackSupport) === 'no' &&
        norm(raw.hindranceComplexity) === 'no' &&
        norm(raw.hindranceCulturalBarriers) === 'no' &&
        norm(raw.hindranceStakeholderResistance) === 'no'
      ) {
        hasAnswer = true;
      }

      const otherVal = norm(raw.hindranceOther);
      if (otherVal === 'yes' || (otherVal.length > 0 && otherVal !== 'n/a')) {
        other += 1;
        hasAnswer = true;
      }

      if (hasAnswer) numberOfRespondents += 1;
    });

    const items = [
      { label: 'Lack of personal interest', value: lackInterest },
      { label: 'Lack of knowledge or awareness', value: lackKnowledge },
      { label: 'Limited resources or budget', value: limitedResources },
      { label: 'Financial constraints', value: financialConstraints },
      { label: 'Insufficient time or competing priorities', value: insufficientTime },
      { label: 'Lack of organizational or leadership support', value: lackSupport },
      { label: 'Complexity or uncertainty of solutions', value: complexity },
      { label: 'Cultural or social barriers', value: culturalBarriers },
      { label: 'Resistance from stakeholders', value: stakeholderResistance },
      { label: 'Other', value: other },
    ];

    // Sort ascending by value
    items.sort((a, b) => a.value - b.value);

    // Extract texts
    const texts = responses
      .map((r) => (r.raw.hindranceOther ?? '').trim())
      .filter((value) => {
        if (!value) return false;
        const lower = value.toLowerCase();
        return lower.length > 0 && lower !== 'n/a';
      });

    return {
      stats: items,
      hindranceOtherTexts: texts,
      totalRespondentsWithAnswer: numberOfRespondents,
      totalEligible: filteredResponses.length,
    };
  }, [responses]);

  return {
    stats,
    hindranceOtherTexts,
    totalRespondentsWithAnswer,
    totalEligible,
    barColor,
    tickColor,
  };
};

// --- COMPONENT 1: Main Chart ---
export const HindrancesToIncorporateSustainability = ({
  onExplore,
  className,
}: {
  onExplore?: () => void;
  className?: string;
}) => {
  const {
    stats,
    hindranceOtherTexts,
    totalRespondentsWithAnswer,
    totalEligible,
    barColor,
    tickColor,
  } = useHindrancesData();
  const { question, description } = useGraphDescription('HindrancesToIncorporateSustainability');

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
      margin: { t: 50, r: 40, b: 60, l: 300 }, // Preserved wide margin
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
      hasExploreData={hindranceOtherTexts.length > 0}
      onExplore={onExplore}
    />
  );
};

// --- COMPONENT 2: Detail List ---
export const HindrancesToIncorporateSustainabilityDetails = ({
  onBack,
}: {
  onBack: () => void;
}) => {
  const { stats, hindranceOtherTexts } = useHindrancesData();
  const { question } = useGraphDescription('HindrancesToIncorporateSustainability');
  const { question: questionDetails, description: descriptionDetails } = useGraphDescription(
    'HindrancesToIncorporateSustainabilityDetails'
  );

  // Calculate rate relative to "Other" checkbox selection
  const otherStat = stats.find((s) => s.label === 'Other');
  const numberOfOtherSelections = otherStat ? otherStat.value : 0;

  const responseRate =
    numberOfOtherSelections > 0 ? (hindranceOtherTexts.length / numberOfOtherSelections) * 100 : 0;

  return (
    <SurveyExploreList
      title={question}
      items={hindranceOtherTexts}
      question={questionDetails}
      description={descriptionDetails}
      numberOfResponses={hindranceOtherTexts.length}
      responseRate={responseRate}
      onBack={onBack}
    />
  );
};

export default HindrancesToIncorporateSustainability;
