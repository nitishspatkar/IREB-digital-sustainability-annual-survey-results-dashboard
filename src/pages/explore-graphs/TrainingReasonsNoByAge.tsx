import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor } from '../../components/GraphViews';
import type { SurveyResponse } from '../../data/data-parsing-logic/SurveyResponse';

// --- Constants & Helpers ---
const TRAINING_REASONS_TEMPLATE = [
  { key: 'trainingNotAware', label: 'I was not aware such programs existed' },
  { key: 'trainingNoOrganizationOffer', label: 'My organization does not offer such programs' },
  { key: 'trainingNoOpportunity', label: 'I have not had the opportunity to attend' },
  { key: 'trainingNoNeed', label: "I don't see the need for such training" },
  { key: 'trainingTooExpensive', label: 'The cost is too high' },
  { key: 'trainingOtherReason', label: 'Other' },
];

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

// Helper to sort age groups naturally
const sortAgeGroups = (a: string, b: string) => {
  const aMatch = a.match(/^(\d+)/);
  const bMatch = b.match(/^(\d+)/);

  if (aMatch && bMatch) {
    return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
  }

  return a.localeCompare(b);
};

// Local helper to check if a valid reason was provided
const hasValidTrainingReasonAnswer = (r: SurveyResponse): boolean => {
  const raw = r.raw;
  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  if (norm(raw.trainingNotAware) === 'yes') return true;
  if (norm(raw.trainingNoOrganizationOffer) === 'yes') return true;
  if (norm(raw.trainingNoOpportunity) === 'yes') return true;
  if (norm(raw.trainingNoNeed) === 'yes') return true;
  if (norm(raw.trainingTooExpensive) === 'yes') return true;

  const oVal = norm(raw.trainingOtherReason);
  if (oVal.length > 0 && oVal !== 'n/a') return true;

  // Explicit 'no' to all options is also a valid answer (though effectively "None of the above" if captured that way)
  // However, usually 'numberOfResponses' counts those who engaged.
  // Matching TrainingReasonsNoDetails logic:
  if (
    norm(raw.trainingNotAware) === 'no' &&
    norm(raw.trainingNoOrganizationOffer) == 'no' &&
    norm(raw.trainingNoOpportunity) === 'no' &&
    norm(raw.trainingNoNeed) === 'no' &&
    norm(raw.trainingTooExpensive) === 'no'
  ) {
    return true;
  }

  return false;
};

// --- The Processor Logic ---
const processTrainingReasonsNoByAge: ChartProcessor = (responses, palette) => {
  const ageGroupReasonsStats = new Map<string, Map<string, number>>();
  const ageGroupEligibleTotals = new Map<string, number>();
  const ageGroupAnsweredTotals = new Map<string, number>();

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // 1. Parse Data
  responses.forEach((r) => {
    const ageGroup = normalize(r.raw.ageGroup ?? '');
    const participatedInTraining = norm(r.raw.participatedInTraining);

    if (!ageGroup || ageGroup.toLowerCase() === 'n/a' || participatedInTraining !== 'no') {
      return;
    }

    if (!ageGroupReasonsStats.has(ageGroup)) {
      ageGroupReasonsStats.set(ageGroup, new Map());
      ageGroupEligibleTotals.set(ageGroup, 0);
      ageGroupAnsweredTotals.set(ageGroup, 0);
    }

    // Count as eligible (denominator)
    ageGroupEligibleTotals.set(ageGroup, (ageGroupEligibleTotals.get(ageGroup) ?? 0) + 1);

    // Only process reasons and count as answered if valid
    if (hasValidTrainingReasonAnswer(r)) {
      ageGroupAnsweredTotals.set(ageGroup, (ageGroupAnsweredTotals.get(ageGroup) ?? 0) + 1);

      const reasons = ageGroupReasonsStats.get(ageGroup)!;

      TRAINING_REASONS_TEMPLATE.forEach((reasonDef) => {
        let isReasonSelected = false;
        if (reasonDef.key === 'trainingOtherReason') {
          const otherValue = norm(r.raw.trainingOtherReason);
          isReasonSelected = otherValue.length > 0 && otherValue !== 'n/a';
        } else {
          isReasonSelected = norm(r.raw[reasonDef.key as keyof typeof r.raw]) === 'yes';
        }

        if (isReasonSelected) {
          reasons.set(reasonDef.label, (reasons.get(reasonDef.label) ?? 0) + 1);
        }
      });
    }
  });

  // 2. Sort & Filter
  const sortedAgeGroups = Array.from(ageGroupEligibleTotals.keys()).sort(sortAgeGroups);
  const displayReasonLabels = TRAINING_REASONS_TEMPLATE.map((d) => d.label);

  // 3. Build Matrices
  // Original zValues: zValues[ageGroupIndex][reasonLabelIndex]
  const zValuesOriginal = sortedAgeGroups.map((ageGroup) =>
    displayReasonLabels.map(
      (reasonLabel) => ageGroupReasonsStats.get(ageGroup)?.get(reasonLabel) ?? 0
    )
  );

  // Transposed zValues: zValues[reasonLabelIndex][ageGroupIndex]
  const zValues = displayReasonLabels.map((_, reasonIndex) =>
    sortedAgeGroups.map((_, ageGroupIndex) => zValuesOriginal[ageGroupIndex][reasonIndex])
  );

  const maxZ = Math.max(...zValues.flat());

  const totalEligible = Array.from(ageGroupEligibleTotals.values()).reduce((a, b) => a + b, 0);
  const totalAnswered = Array.from(ageGroupAnsweredTotals.values()).reduce((a, b) => a + b, 0);

  // 4. Calculate Text Colors (Dynamic contrast)
  // Original textColors: textColors[ageGroupIndex][reasonLabelIndex]
  const textColorsOriginal = zValuesOriginal.map((row) =>
    row.map((val) => (val / maxZ > 0.4 ? '#FFFFFF' : palette.grey))
  );
  // Transposed textColors: textColors[reasonLabelIndex][ageGroupIndex]
  const textColors = displayReasonLabels.map((_, reasonIndex) =>
    sortedAgeGroups.map((_, ageGroupIndex) => textColorsOriginal[ageGroupIndex][reasonIndex])
  );

  // 5. Create Trace
  const trace: Data = {
    type: 'heatmap',
    x: sortedAgeGroups,
    y: displayReasonLabels,
    z: zValues,
    colorscale: [
      [0, '#F2F2F2'], // Light color from original
      [1, palette.berry],
    ],
    xgap: 2,
    ygap: 2,
    showscale: false,
    text: zValues.map((row) => row.map((v) => (v > 0 ? v.toString() : ''))) as unknown as string[],
    texttemplate: '%{text}',
    textfont: {
      family: 'PP Mori, sans-serif',
      size: 12,
      color: textColors as unknown as string,
    },
    hoverinfo: 'x+y+z',
  };

  return {
    stats: {
      numberOfResponses: totalAnswered,
      totalEligible: totalEligible,
    },
    traces: [trace],
  };
};

// --- The Component ---
export const TrainingReasonsNoByAge = ({
  onBack,
  showBackButton = true,
}: {
  onBack: () => void;
  showBackButton?: boolean;
}) => {
  // Static layout overrides
  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 60, r: 20, b: 200, l: 300 }, // Adjusted margins for new axis orientation
      xaxis: {
        side: 'top', // X-axis at the bottom for age groups
        tickangle: 0, // No rotation for age group labels
        automargin: true,
        title: {
          text: 'Age Group',
        },
      },
      yaxis: {
        automargin: true,
        ticks: 'outside',
        ticklen: 10,
        tickcolor: 'rgba(0,0,0,0)',
      },
    }),
    []
  );

  return (
    <GenericChart
      graphId="TrainingReasonsNoByAge"
      processor={processTrainingReasonsNoByAge}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
    />
  );
};
