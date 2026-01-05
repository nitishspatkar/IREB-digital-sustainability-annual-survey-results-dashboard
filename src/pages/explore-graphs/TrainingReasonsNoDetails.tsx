import { GenericChart } from '../../components/GraphViews';
import type { ChartProcessor } from '../../components/GraphViews';
import type { SurveyResponse } from '../../data/data-parsing-logic/SurveyResponse';

// --- SHARED DATA LOGIC ---
export const getTrainingReasonsStats = (responses: readonly SurveyResponse[]) => {
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
};

const processor: ChartProcessor = (responses) => {
  const { stats, otherTexts } = getTrainingReasonsStats(responses);
  const otherStat = stats.find((s) => s.key === 'trainingOtherReason');
  const numberOfOtherSelections = otherStat ? otherStat.count : 0;

  return {
    items: otherTexts,
    stats: {
      numberOfResponses: otherTexts.length,
      totalEligible: numberOfOtherSelections,
    },
  };
};

export const TrainingReasonsNoDetails = ({ onBack }: { onBack: () => void }) => {
  return (
    <GenericChart
      graphId="TrainingReasonsNoDetails"
      processor={processor}
      isEmbedded={true}
      onBack={onBack}
    />
  );
};
