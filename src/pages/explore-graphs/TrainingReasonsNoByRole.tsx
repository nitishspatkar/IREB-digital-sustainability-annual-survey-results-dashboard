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

// --- The Processor Logic ---
const processTrainingReasonsNoByRole: ChartProcessor = (responses, palette) => {
  const roleReasonsStats = new Map<string, Map<string, number>>();
  const roleEligibleTotals = new Map<string, number>();
  const roleAnsweredTotals = new Map<string, number>();

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // 1. Parse Data
  responses.forEach((r) => {
    const role = normalize(r.raw.role ?? '');
    const participatedInTraining = norm(r.raw.participatedInTraining);

    if (!role || role.toLowerCase() === 'n/a' || participatedInTraining !== 'no') {
      return;
    }

    if (!roleReasonsStats.has(role)) {
      roleReasonsStats.set(role, new Map());
      roleEligibleTotals.set(role, 0);
      roleAnsweredTotals.set(role, 0);
    }

    // Eligible (Denominator)
    roleEligibleTotals.set(role, (roleEligibleTotals.get(role) ?? 0) + 1);

    // Answered (Numerator) & Reasons
    if (hasValidTrainingReasonAnswer(r)) {
      roleAnsweredTotals.set(role, (roleAnsweredTotals.get(role) ?? 0) + 1);

      const reasons = roleReasonsStats.get(role)!;

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
  const sortedRoles = Array.from(roleEligibleTotals.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([role]) => role);

  const totalEligible = Array.from(roleEligibleTotals.values()).reduce((a, b) => a + b, 0);
  const totalAnswered = Array.from(roleAnsweredTotals.values()).reduce((a, b) => a + b, 0);

  // 3. Define Colors for Reasons
  const reasonColors: Record<string, string> = {
    'I was not aware such programs existed': palette.berry,
    'My organization does not offer such programs': palette.spring,
    'I have not had the opportunity to attend': palette.mandarin,
    "I don't see the need for such training": palette.darkSpring,
    'The cost is too high': palette.lightBerry,
    Other: palette.grey,
  };

  // 4. Build Traces (One per Reason)
  const traces: Data[] = TRAINING_REASONS_TEMPLATE.map((reasonDef) => {
    const reasonLabel = reasonDef.label;
    const xValues = sortedRoles.map((role) => roleReasonsStats.get(role)?.get(reasonLabel) ?? 0);

    return {
      type: 'bar',
      name: reasonLabel,
      orientation: 'h',
      y: sortedRoles,
      x: xValues,
      marker: {
        color: reasonColors[reasonLabel],
      },
      text: xValues.map((v) => (v > 0 ? v.toString() : '')),
      textposition: 'inside',
      insidetextanchor: 'middle',
      textfont: {
        family: 'PP Mori, sans-serif',
        size: 13,
        color: '#FFFFFF', // White text for contrast inside bars
      },
      hoverinfo: 'x+y+name',
    };
  });

  return {
    stats: {
      numberOfResponses: totalAnswered,
      totalEligible: totalEligible,
    },
    traces: traces,
  };
};

// --- The Component ---
export const TrainingReasonsNoByRole = ({
  onBack,
  showBackButton = true,
}: {
  onBack: () => void;
  showBackButton?: boolean;
}) => {
  // Static layout overrides
  const layout = useMemo<Partial<Layout>>(
    () => ({
      barmode: 'stack', // Stacked bars
      bargap: 0.15, // Thicker bars
      margin: { t: 40, r: 20, b: 60, l: 200 }, // Left margin for Roles
      uniformtext: {
        mode: 'show', // Versteckt Zahlen, die nicht passen, statt sie zu verkleinern
        minsize: 10, // Muss identisch mit Ihrer textfont.size sein
      },
      xaxis: {
        title: { text: 'Number of Respondents' },
        automargin: true,
      },
      yaxis: {
        automargin: true,
        ticks: 'outside',
        ticklen: 10,
        tickcolor: 'rgba(0,0,0,0)',
      },
      legend: {
        orientation: 'h',
        yanchor: 'bottom',
        y: 1.1, // Position legend above chart
        xanchor: 'right',
        x: 1,
      },
    }),
    []
  );

  return (
    <GenericChart
      graphId="TrainingReasonsNoByRole"
      processor={processTrainingReasonsNoByRole}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
    />
  );
};
