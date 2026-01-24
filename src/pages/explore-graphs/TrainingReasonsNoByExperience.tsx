import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor, type DataExtractor } from '../../components/GraphViews';
import type { SurveyResponse } from '../../data/data-parsing-logic/SurveyResponse';
import { createDumbbellComparisonStrategy } from '../../components/comparision-components/DumbbellComparisonStrategy';
import type { HorizontalBarData } from '../../components/comparision-components/HorizontalBarComparisonStrategy';

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

// Helper to sort experience ranges naturally
const sortExperience = (a: string, b: string) => {
  if (a.startsWith('Less than')) return -1;
  if (b.startsWith('Less than')) return 1;
  if (a.startsWith('More than')) return 1;
  if (b.startsWith('More than')) return -1;
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

// --- Data Extractor for Comparison ---
const extractTrainingReasonsNoByExperienceData: DataExtractor<HorizontalBarData> = (responses) => {
  const experienceReasonCounts = new Map<string, Map<string, number>>();
  let totalValidResponses = 0;

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  responses.forEach((r) => {
    const experience = normalize(r.raw.professionalExperienceYears ?? '');
    const participatedInTraining = norm(r.raw.participatedInTraining);

    if (!experience || experience.toLowerCase() === 'n/a' || participatedInTraining !== 'no') {
      return;
    }

    if (hasValidTrainingReasonAnswer(r)) {
      totalValidResponses++;

      if (!experienceReasonCounts.has(experience)) {
        experienceReasonCounts.set(experience, new Map());
      }
      const reasons = experienceReasonCounts.get(experience)!;

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

  const items: { label: string; value: number }[] = [];

  experienceReasonCounts.forEach((reasonsMap, experience) => {
    reasonsMap.forEach((count, reasonLabel) => {
      // Calculate percentage of TOTAL valid "No-Training" population
      const pct = totalValidResponses > 0 ? (count / totalValidResponses) * 100 : 0;
      items.push({
        label: `${experience}<br>${reasonLabel}`,
        value: pct,
      });
    });
  });

  return {
    items,
    stats: {
      numberOfResponses: totalValidResponses,
    },
  };
};

const baseComparisonStrategy = createDumbbellComparisonStrategy({
  normalizeToPercentage: false,
  formatAsPercentage: true,
  sortBy: 'absoluteDifference',
});

const comparisonStrategy: typeof baseComparisonStrategy = (
  currentYearData,
  compareYearData,
  currentYear,
  compareYear,
  palette
) => {
  const result = baseComparisonStrategy(
    currentYearData,
    compareYearData,
    currentYear,
    compareYear,
    palette
  );

  if (result && 'layout' in result && result.layout) {
    result.layout.yaxis = {
      ...result.layout.yaxis,
      dtick: 1, // Force display of all labels
    };

    result.layout.xaxis = {
      ...result.layout.xaxis,
      automargin: true,
      title: {
        ...(result.layout.xaxis?.title || {}),
        standoff: 20,
      },
    };

    // Dynamic height adjustment
    const itemCount = (result.traces[1] as Data & { y: string[] }).y?.length || 0;
    const dynamicHeight = Math.max(520, itemCount * 50 + 100);

    result.layout.height = dynamicHeight;
  }

  return result;
};

// --- The Processor Logic ---
const processTrainingReasonsNoByExperience: ChartProcessor = (responses, palette) => {
  const experienceReasonsStats = new Map<string, Map<string, number>>();
  const experienceEligibleTotals = new Map<string, number>();
  const experienceAnsweredTotals = new Map<string, number>();

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // 1. Parse Data
  responses.forEach((r) => {
    const experience = normalize(r.raw.professionalExperienceYears ?? '');
    const participatedInTraining = norm(r.raw.participatedInTraining);

    if (!experience || experience.toLowerCase() === 'n/a' || participatedInTraining !== 'no') {
      return;
    }

    if (!experienceReasonsStats.has(experience)) {
      experienceReasonsStats.set(experience, new Map());
      experienceEligibleTotals.set(experience, 0);
      experienceAnsweredTotals.set(experience, 0);
    }

    // Eligible (Denominator)
    experienceEligibleTotals.set(experience, (experienceEligibleTotals.get(experience) ?? 0) + 1);

    // Answered (Numerator) & Reasons
    if (hasValidTrainingReasonAnswer(r)) {
      experienceAnsweredTotals.set(experience, (experienceAnsweredTotals.get(experience) ?? 0) + 1);

      const reasons = experienceReasonsStats.get(experience)!;

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
  const sortedExperiences = Array.from(experienceEligibleTotals.keys()).sort(sortExperience);
  const displayReasonLabels = TRAINING_REASONS_TEMPLATE.map((d) => d.label);

  // 3. Build Matrices
  // Original zValues: zValues[experienceIndex][reasonLabelIndex]
  const zValuesOriginal = sortedExperiences.map((experience) =>
    displayReasonLabels.map(
      (reasonLabel) => experienceReasonsStats.get(experience)?.get(reasonLabel) ?? 0
    )
  );

  // Transposed zValues: zValues[reasonLabelIndex][experienceIndex]
  const zValues = displayReasonLabels.map((_, reasonIndex) =>
    sortedExperiences.map((_, experienceIndex) => zValuesOriginal[experienceIndex][reasonIndex])
  );

  const maxZ = Math.max(...zValues.flat());

  const totalEligible = Array.from(experienceEligibleTotals.values()).reduce((a, b) => a + b, 0);
  const totalAnswered = Array.from(experienceAnsweredTotals.values()).reduce((a, b) => a + b, 0);

  // 4. Calculate Text Colors (Dynamic contrast)
  // Original textColors: textColors[experienceIndex][reasonLabelIndex]
  const textColorsOriginal = zValuesOriginal.map((row) =>
    row.map((val) => (val / maxZ > 0.4 ? '#FFFFFF' : palette.grey))
  );
  // Transposed textColors: textColors[reasonLabelIndex][experienceIndex]
  const textColors = displayReasonLabels.map((_, reasonIndex) =>
    sortedExperiences.map((_, experienceIndex) => textColorsOriginal[experienceIndex][reasonIndex])
  );

  // 5. Create Trace
  const trace: Data = {
    type: 'heatmap',
    x: sortedExperiences,
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
      size: 13,
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
export const TrainingReasonsNoByExperience = ({
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
        tickangle: 0, // No rotation for experience labels
        automargin: true,
        title: {
          text: 'Professional Experience',
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
      graphId="TrainingReasonsNoByExperience"
      processor={processTrainingReasonsNoByExperience}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
      dataExtractor={extractTrainingReasonsNoByExperienceData}
      comparisonStrategy={comparisonStrategy}
    />
  );
};
