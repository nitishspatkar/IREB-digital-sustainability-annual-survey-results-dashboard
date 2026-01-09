import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor } from '../../components/GraphViews';

// --- Constants & Helpers ---
const TRAINING_REASONS_NOT_MORE_TEMPLATE = [
  { key: 'notMoreTrainingNotAware', label: 'I was not aware such programs existed' },
  { key: 'notMoreTrainingNoOrganization', label: 'My organization does not offer such programs' },
  { key: 'notMoreTrainingNoOpportunity', label: 'I have not had the opportunity to attend' },
  { key: 'notMoreTrainingNoNeed', label: "I don't see the need for such training" },
  { key: 'notMoreTrainingTooExpensive', label: 'The cost is too high' },
  { key: 'notMoreTrainingOther', label: 'Other' },
];

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

// Helper to sort professional experience groups naturally
const sortProfessionalExperience = (a: string, b: string) => {
  const getMinValue = (s: string) => {
    if (s.includes('Less than 1')) return 0;
    if (s.includes('More than 20')) return 21;
    const match = s.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : Infinity;
  };
  return getMinValue(a) - getMinValue(b);
};

// --- The Processor Logic ---
const processTrainingReasonsNotMoreByExperience: ChartProcessor = (responses, palette) => {
  const experienceGroupReasonsStats = new Map<string, Map<string, number>>();
  const experienceGroupEligibleTotals = new Map<string, number>(); // Eligible: Participated in training
  const experienceGroupAnsweredTotals = new Map<string, number>(); // Answered: Selected at least one reason

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // Helper to check if respondent gave a valid answer
  const hasValidAnswer = (r: any) => {
    const raw = r.raw;
    if (norm(raw.notMoreTrainingNotAware) === 'yes') return true;
    if (norm(raw.notMoreTrainingNoOrganization) === 'yes') return true;
    if (norm(raw.notMoreTrainingNoOpportunity) === 'yes') return true;
    if (norm(raw.notMoreTrainingNoNeed) === 'yes') return true;
    if (norm(raw.notMoreTrainingTooExpensive) === 'yes') return true;

    // Explicit "No" to all specific options counts as an answer (valid 'none')
    if (
      norm(raw.notMoreTrainingNotAware) === 'no' &&
      norm(raw.notMoreTrainingNoOrganization) === 'no' &&
      norm(raw.notMoreTrainingNoOpportunity) === 'no' &&
      norm(raw.notMoreTrainingNoNeed) === 'no' &&
      norm(raw.notMoreTrainingTooExpensive) === 'no'
    ) {
      return true;
    }

    const oVal = norm(raw.notMoreTrainingOther);
    if (oVal.length > 0 && oVal !== 'n/a') return true;

    return false;
  };

  // 1. Parse Data
  // Filter for respondents who *have* participated in training
  responses.forEach((r) => {
    const experienceGroup = normalize(r.raw.professionalExperienceYears ?? '');
    const participatedInTraining = norm(r.raw.participatedInTraining);

    if (
      !experienceGroup ||
      experienceGroup.toLowerCase() === 'n/a' ||
      participatedInTraining !== 'yes'
    ) {
      return;
    }

    if (!experienceGroupReasonsStats.has(experienceGroup)) {
      experienceGroupReasonsStats.set(experienceGroup, new Map());
      experienceGroupEligibleTotals.set(experienceGroup, 0);
      experienceGroupAnsweredTotals.set(experienceGroup, 0);
    }

    // Increment eligible
    experienceGroupEligibleTotals.set(
      experienceGroup,
      (experienceGroupEligibleTotals.get(experienceGroup) ?? 0) + 1
    );

    // Check if answered
    if (hasValidAnswer(r)) {
      experienceGroupAnsweredTotals.set(
        experienceGroup,
        (experienceGroupAnsweredTotals.get(experienceGroup) ?? 0) + 1
      );
    }

    const reasons = experienceGroupReasonsStats.get(experienceGroup)!;

    TRAINING_REASONS_NOT_MORE_TEMPLATE.forEach((reasonDef) => {
      let isReasonSelected = false;
      if (reasonDef.key === 'notMoreTrainingOther') {
        const otherValue = norm(r.raw[reasonDef.key as keyof typeof r.raw]);
        isReasonSelected = otherValue.length > 0 && otherValue !== 'n/a';
      } else {
        isReasonSelected = norm(r.raw[reasonDef.key as keyof typeof r.raw]) === 'yes';
      }

      if (isReasonSelected) {
        reasons.set(reasonDef.label, (reasons.get(reasonDef.label) ?? 0) + 1);
      }
    });
  });

  // 2. Sort & Filter
  const sortedExperienceGroups = Array.from(experienceGroupEligibleTotals.keys()).sort(
    sortProfessionalExperience
  );
  const displayReasonLabels = TRAINING_REASONS_NOT_MORE_TEMPLATE.map((d) => d.label);

  // 3. Build Matrices
  // Original zValues: zValues[experienceGroupIndex][reasonLabelIndex]
  const zValuesOriginal = sortedExperienceGroups.map((experienceGroup) =>
    displayReasonLabels.map(
      (reasonLabel) => experienceGroupReasonsStats.get(experienceGroup)?.get(reasonLabel) ?? 0
    )
  );

  // Transposed zValues: zValues[reasonLabelIndex][experienceGroupIndex]
  const zValues = displayReasonLabels.map((_, reasonIndex) =>
    sortedExperienceGroups.map(
      (_, experienceGroupIndex) => zValuesOriginal[experienceGroupIndex][reasonIndex]
    )
  );

  const maxZ = Math.max(...zValues.flat());

  const totalEligible = Array.from(experienceGroupEligibleTotals.values()).reduce(
    (a, b) => a + b,
    0
  );
  const totalAnswered = Array.from(experienceGroupAnsweredTotals.values()).reduce(
    (a, b) => a + b,
    0
  );

  // 4. Calculate Text Colors (Dynamic contrast)
  // Original textColors: textColors[experienceGroupIndex][reasonLabelIndex]
  const textColorsOriginal = zValuesOriginal.map((row) =>
    row.map((val) => (val / maxZ > 0.4 ? '#FFFFFF' : palette.grey))
  );
  // Transposed textColors: textColors[reasonLabelIndex][experienceGroupIndex]
  const textColors = displayReasonLabels.map((_, reasonIndex) =>
    sortedExperienceGroups.map(
      (_, experienceGroupIndex) => textColorsOriginal[experienceGroupIndex][reasonIndex]
    )
  );

  // 5. Create Trace
  const trace: Data = {
    type: 'heatmap',
    x: sortedExperienceGroups,
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
export const TrainingReasonsNotMoreByExperience = ({
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
        side: 'top', // X-axis at the bottom for experience groups
        tickangle: 0, // No rotation for labels
        automargin: true,
        title: {
          text: 'Professional Experience (Years)',
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
      graphId="TrainingReasonsNotMoreByExperience"
      processor={processTrainingReasonsNotMoreByExperience}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
    />
  );
};
