import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';

import { useSurveyData } from '../../../data/data-parsing-logic/SurveyContext';
import useThemeColor from '../../../hooks/useThemeColor';
import { SurveyChart, SurveyExploreList } from '../../../components/GraphViews';
import { useGraphDescription } from '../../../hooks/useGraphDescription';

const useTrainingReasonsNotMoreData = () => {
  const responses = useSurveyData();
  const barColor = useThemeColor('--color-ireb-berry');
  const tickColor = useThemeColor('--color-ireb-grey-01');

  const { stats, otherTexts, respondentsWithAnyAnswer, totalEligible } = useMemo(() => {
    const norm = (v: string) => v?.trim().toLowerCase() ?? '';

    // Precondition: Q10 = Yes
    const filteredResponses = responses.filter((r) => norm(r.raw.participatedInTraining) === 'yes');

    let countAware = 0,
      countNoOffer = 0,
      countNoOpp = 0,
      countNoNeed = 0,
      countExpensive = 0,
      countOther = 0;
    let withAnswer = 0;

    filteredResponses.forEach((r) => {
      const raw = r.raw;
      let hasAnswer = false;

      if (norm(raw.notMoreTrainingNotAware) === 'yes') {
        countAware++;
        hasAnswer = true;
      }
      if (norm(raw.notMoreTrainingNoOrganization) === 'yes') {
        countNoOffer++;
        hasAnswer = true;
      }
      if (norm(raw.notMoreTrainingNoOpportunity) === 'yes') {
        countNoOpp++;
        hasAnswer = true;
      }
      if (norm(raw.notMoreTrainingNoNeed) === 'yes') {
        countNoNeed++;
        hasAnswer = true;
      }
      if (norm(raw.notMoreTrainingTooExpensive) === 'yes') {
        countExpensive++;
        hasAnswer = true;
      }

      // Exakte Kopie der Logik aus TrainingReasonsNo
      if (
        norm(raw.notMoreTrainingNotAware) === 'no' &&
        norm(raw.notMoreTrainingNoOrganization) === 'no' &&
        norm(raw.notMoreTrainingNoOpportunity) === 'no' &&
        norm(raw.notMoreTrainingNoNeed) === 'no' &&
        norm(raw.notMoreTrainingTooExpensive) === 'no'
      ) {
        hasAnswer = true;
      }

      const oVal = norm(raw.notMoreTrainingOther);
      if (oVal.length > 0 && oVal !== 'n/a') {
        countOther++;
        hasAnswer = true;
      }

      if (hasAnswer) withAnswer++;
    });

    const items = [
      {
        label: 'I was not aware such programs existed',
        key: 'notMoreTrainingNotAware',
        count: countAware,
      },
      {
        label: 'My organization does not offer such programs',
        key: 'notMoreTrainingNoOrganization',
        count: countNoOffer,
      },
      {
        label: 'I have not had the opportunity to attend',
        key: 'notMoreTrainingNoOpportunity',
        count: countNoOpp,
      },
      {
        label: "I don't see the need for such training",
        key: 'notMoreTrainingNoNeed',
        count: countNoNeed,
      },
      { label: 'The cost is too high', key: 'notMoreTrainingTooExpensive', count: countExpensive },
      { label: 'Other', key: 'notMoreTrainingOther', count: countOther },
    ].sort((a, b) => a.count - b.count);

    const texts = filteredResponses
      .map((r) => (r.raw.notMoreTrainingOther ?? '').trim())
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

export const TrainingReasonsNotMore = ({
  onExplore,
  className,
}: {
  onExplore?: () => void;
  className?: string;
}) => {
  const { stats, otherTexts, respondentsWithAnyAnswer, totalEligible, barColor, tickColor } =
    useTrainingReasonsNotMoreData();

  const responseRate = totalEligible > 0 ? (respondentsWithAnyAnswer / totalEligible) * 100 : 0;

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
      margin: { t: 60, r: 40, b: 60, l: 300 },
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

  const { question, description } = useGraphDescription('TrainingReasonsNotMore');

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

export const TrainingReasonsNotMoreDetails = ({ onBack }: { onBack: () => void }) => {
  const { stats, otherTexts } = useTrainingReasonsNotMoreData();
  const { question } = useGraphDescription('TrainingReasonsNotMore');
  const { question: questionDetails, description: descriptionDetails } = useGraphDescription(
    'TrainingReasonsNotMoreDetails'
  );

  const otherStat = stats.find((s) => s.key === 'notMoreTrainingOther');
  const numberOfOtherSelections = otherStat?.count ?? 0;
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

export default TrainingReasonsNotMore;
