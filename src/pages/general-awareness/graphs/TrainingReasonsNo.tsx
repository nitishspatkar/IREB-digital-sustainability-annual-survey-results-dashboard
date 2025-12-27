import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';

import { useSurveyData } from '../../../data/SurveyContext';
import useThemeColor from '../../../hooks/useThemeColor';
import { SurveyChart, SurveyExploreList } from '../../../components/GraphViews';
import graphDescriptions from '../../../data/graphDescriptions.json';

// --- SHARED DATA LOGIC ---
const useTrainingReasonsData = () => {
  const responses = useSurveyData();
  const barColor = useThemeColor('--color-ireb-berry');
  const tickColor = useThemeColor('--color-ireb-grey-01');

  const { stats, otherTexts, respondentsWithAnyAnswer, totalEligible } = useMemo(() => {
    const norm = (v: string) => v?.trim().toLowerCase() ?? '';

    // Precondition: Q27 = No
    const filteredResponses = responses.filter((r) => norm(r.raw.participatedInTraining) === 'no');

    let countAware = 0;
    let countNoOffer = 0;
    let countNoOpp = 0;
    let countNoNeed = 0;
    let countExpensive = 0;
    let countOther = 0;
    let withAnswer = 0;

    filteredResponses.forEach((r) => {
      const raw = r.raw;
      let hasAnswer = false;

      if (norm(raw.trainingNotAware) === 'yes') {
        countAware++;
        hasAnswer = true;
      }
      if (norm(raw.trainingNoOrganizationOffer) === 'yes') {
        countNoOffer++;
        hasAnswer = true;
      }
      if (norm(raw.trainingNoOpportunity) === 'yes') {
        countNoOpp++;
        hasAnswer = true;
      }
      if (norm(raw.trainingNoNeed) === 'yes') {
        countNoNeed++;
        hasAnswer = true;
      }
      if (norm(raw.trainingTooExpensive) === 'yes') {
        countExpensive++;
        hasAnswer = true;
      }

      if (
        norm(raw.trainingNotAware) === 'no' &&
        norm(raw.trainingNoOrganizationOffer) == 'no' &&
        norm(raw.trainingNoOpportunity) === 'no' &&
        norm(raw.trainingNoNeed) === 'no' &&
        norm(raw.trainingTooExpensive) === 'no'
      )
        hasAnswer = true;

      const oVal = norm(raw.trainingOtherReason);
      if (oVal.length > 0 && oVal !== 'n/a') {
        countOther++;
        hasAnswer = true;
      }

      if (hasAnswer) withAnswer++;
    });

    const items = [
      {
        label: 'I was not aware such programs existed',
        key: 'trainingNotAware',
        count: countAware,
      },
      {
        label: 'My organization does not offer such programs',
        key: 'trainingNoOrganizationOffer',
        count: countNoOffer,
      },
      {
        label: 'I have not had the opportunity to attend',
        key: 'trainingNoOpportunity',
        count: countNoOpp,
      },
      {
        label: "I don't see the need for such training",
        key: 'trainingNoNeed',
        count: countNoNeed,
      },
      { label: 'The cost is too high', key: 'trainingTooExpensive', count: countExpensive },
      { label: 'Other', key: 'trainingOtherReason', count: countOther },
    ].sort((a, b) => a.count - b.count);

    const texts = filteredResponses
      .map((r) => (r.raw.trainingOtherReason ?? '').trim())
      .filter((v) => {
        const low = v.toLowerCase();
        return low.length > 0 && low !== 'n/a';
      });

    return {
      stats: items,
      otherTexts: texts,
      respondentsWithAnyAnswer: withAnswer,
      totalEligible: filteredResponses.length,
    };
  }, [responses]);

  return { stats, otherTexts, respondentsWithAnyAnswer, totalEligible, barColor, tickColor };
};

// --- COMPONENT 1: Main Chart (Dashboard) ---
export const TrainingReasonsNo = ({
  onExplore,
  className,
}: {
  onExplore?: () => void;
  className?: string;
}) => {
  const { stats, otherTexts, respondentsWithAnyAnswer, totalEligible, barColor, tickColor } =
    useTrainingReasonsData();

  const responseRate = totalEligible > 0 ? (respondentsWithAnyAnswer / totalEligible) * 100 : 0;

  // Chart Logic
  const chartData = useMemo<Data[]>(
    () => [
      {
        type: 'bar',
        orientation: 'h',
        x: stats.map((s) => s.count),
        y: stats.map((s) => s.label),
        marker: { color: barColor },
        text: stats.map((s) => s.count.toString()),
        textposition: 'outside',
        textfont: { family: 'PP Mori, sans-serif', size: 12, color: tickColor },
        cliponaxis: false,
        hoverinfo: 'none',
      },
    ],
    [stats, barColor, tickColor]
  );

  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 60, r: 40, b: 60, l: 300 }, // Preserved large left margin for labels
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

  const question = graphDescriptions.TrainingReasonsNo.question;
  const description = graphDescriptions.TrainingReasonsNo.description;

  return (
    <SurveyChart
      className={className}
      question={question}
      description={description}
      numberOfResponses={respondentsWithAnyAnswer}
      responseRate={responseRate}
      data={chartData}
      layout={layout}
      hasExploreData={otherTexts.length > 0}
      onExplore={onExplore}
    />
  );
};

// --- COMPONENT 2: Detail List (Explore Page) ---
export const TrainingReasonsNoDetails = ({ onBack }: { onBack: () => void }) => {
  const { stats, otherTexts } = useTrainingReasonsData();

  const questionHeaderOther = graphDescriptions.TrainingReasonsNoDetails.question;

  const mainQuestion = graphDescriptions.TrainingReasonsNo.question;
  const otherStat = stats.find((s) => s.key === 'trainingOtherReason');
  const numberOfOtherSelections = otherStat ? otherStat.count : 0;

  const responseRate =
    numberOfOtherSelections > 0 ? (otherTexts.length / numberOfOtherSelections) * 100 : 0;

  return (
    <SurveyExploreList
      title={mainQuestion}
      items={otherTexts}
      question={questionHeaderOther ?? mainQuestion}
      description={graphDescriptions.TrainingReasonsNoDetails.description}
      numberOfResponses={otherTexts.length}
      responseRate={responseRate}
      onBack={onBack}
    />
  );
};

export default TrainingReasonsNo;
