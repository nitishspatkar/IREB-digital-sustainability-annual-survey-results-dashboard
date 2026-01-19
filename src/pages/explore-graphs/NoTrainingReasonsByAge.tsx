import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor } from '../../components/GraphViews';
import type { SurveyResponse } from '../../data/data-parsing-logic/SurveyResponse';

// --- Constants & Helpers ---
const NO_TRAINING_REASONS_TEMPLATE = [
  { key: 'orgNoTrainingLackAwareness', label: 'Lack of awareness' },
  { key: 'orgNoTrainingLackUnderstanding', label: 'Lack of understanding' },
  { key: 'orgNoTrainingNoDemand', label: 'No demand from employees' },
  { key: 'orgNoTrainingLimitedBudget', label: 'Limited budget/resources' },
  { key: 'orgNoTrainingNotPriority', label: 'Not a priority' },
  { key: 'orgNoTrainingNotSure', label: 'Not sure' },
  { key: 'orgNoTrainingOther', label: 'Other' },
];

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

// Local helper to check if a valid reason was provided
const hasValidNoTrainingReasonAnswer = (r: SurveyResponse): boolean => {
  const raw = r.raw;
  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  if (norm(raw.orgNoTrainingLackAwareness) === 'yes') return true;
  if (norm(raw.orgNoTrainingLackUnderstanding) === 'yes') return true;
  if (norm(raw.orgNoTrainingNoDemand) === 'yes') return true;
  if (norm(raw.orgNoTrainingLimitedBudget) === 'yes') return true;
  if (norm(raw.orgNoTrainingNotPriority) === 'yes') return true;
  if (norm(raw.orgNoTrainingNotSure) === 'yes') return true;

  const oVal = norm(raw.orgNoTrainingOther);
  if (oVal.length > 0 && oVal !== 'n/a') return true;

  return false;
};

// --- The Processor Logic ---
const processNoTrainingReasonsByAge: ChartProcessor = (responses, palette) => {
  const ageReasonsStats = new Map<string, Map<string, number>>();
  const ageAnsweredTotals = new Map<string, number>();

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // 1. Parse Data
  responses.forEach((r) => {
    const ageGroup = normalize(r.raw.ageGroup ?? '');

    if (!ageGroup || ageGroup.toLowerCase() === 'n/a') {
      return;
    }

    if (!ageReasonsStats.has(ageGroup)) {
      ageReasonsStats.set(ageGroup, new Map());
      ageAnsweredTotals.set(ageGroup, 0);
    }

    // Answered (Numerator) & Reasons
    if (hasValidNoTrainingReasonAnswer(r)) {
      ageAnsweredTotals.set(ageGroup, (ageAnsweredTotals.get(ageGroup) ?? 0) + 1);

      const reasons = ageReasonsStats.get(ageGroup)!;

      NO_TRAINING_REASONS_TEMPLATE.forEach((reasonDef) => {
        let isReasonSelected = false;
        if (reasonDef.key === 'orgNoTrainingOther') {
          const otherValue = norm(r.raw.orgNoTrainingOther);
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

  // 2. Sort & Filter (Sort by Age Group numeric start)
  const sortedAgeGroups = Array.from(ageAnsweredTotals.entries())
    .sort((a, b) => {
      const aMatch = a[0].match(/^(\d+)/);
      const bMatch = b[0].match(/^(\d+)/);
      if (aMatch && bMatch) {
        return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
      }
      return a[0].localeCompare(b[0]);
    })
    .map(([age]) => age);

  const totalAnswered = Array.from(ageAnsweredTotals.values()).reduce((a, b) => a + b, 0);

  // 3. Define Colors for Reasons
  const reasonColors: Record<string, string> = {
    'Lack of awareness': palette.berry,
    'Lack of understanding': palette.spring,
    'No demand from employees': palette.mandarin,
    'Limited budget/resources': palette.darkSpring,
    'Not a priority': palette.lightBerry,
    'Not sure': palette.grey02,
    Other: palette.grey,
  };

  // 4. Build Traces (One per Reason)
  const traces: Data[] = NO_TRAINING_REASONS_TEMPLATE.map((reasonDef) => {
    const reasonLabel = reasonDef.label;
    const xValues = sortedAgeGroups.map((age) => ageReasonsStats.get(age)?.get(reasonLabel) ?? 0);

    return {
      type: 'bar',
      name: reasonLabel,
      orientation: 'h',
      y: sortedAgeGroups,
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
        color: '#FFFFFF',
      },
      hoverinfo: 'x+y+name',
    };
  });

  return {
    stats: {
      numberOfResponses: totalAnswered,
    },
    traces: traces,
  };
};

// --- The Component ---
export const NoTrainingReasonsByAge = ({
  onBack,
  showBackButton = true,
}: {
  onBack: () => void;
  showBackButton?: boolean;
}) => {
  const layout = useMemo<Partial<Layout>>(
    () => ({
      barmode: 'stack',
      bargap: 0.15,
      margin: { t: 40, r: 20, b: 60, l: 120 }, // Adjusted left margin for Age Groups
      uniformtext: {
        mode: 'show',
        minsize: 10,
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
        y: 1.1,
        xanchor: 'right',
        x: 1,
        traceorder: 'normal',
      },
    }),
    []
  );

  return (
    <GenericChart
      graphId="NoTrainingReasonsByAge"
      processor={processNoTrainingReasonsByAge}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
    />
  );
};
