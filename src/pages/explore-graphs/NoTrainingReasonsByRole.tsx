import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor, type DataExtractor } from '../../components/GraphViews';
import type { SurveyResponse } from '../../data/data-parsing-logic/SurveyResponse';
import { createDumbbellComparisonStrategy } from '../../components/comparision-components/DumbbellComparisonStrategy';
import type { HorizontalBarData } from '../../components/comparision-components/HorizontalBarComparisonStrategy';

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

const extractNoTrainingReasonsByRoleData: DataExtractor<HorizontalBarData> = (responses) => {
  const roleCounts = new Map<string, Map<string, number>>();
  let totalValidResponses = 0;
  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  responses.forEach((r) => {
    const role = normalize(r.raw.role ?? '');

    if (!role || role.toLowerCase() === 'n/a') {
      return;
    }

    if (hasValidNoTrainingReasonAnswer(r)) {
      totalValidResponses++;

      if (!roleCounts.has(role)) {
        roleCounts.set(role, new Map());
      }
      const reasons = roleCounts.get(role)!;

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

  const items: { label: string; value: number }[] = [];

  const sortedRoles = Array.from(roleCounts.keys()).sort();

  sortedRoles.forEach((role) => {
    const reasonsMap = roleCounts.get(role)!;
    reasonsMap.forEach((count, reasonLabel) => {
      // Percentage of TOTAL valid responses for consistency with other "Reason" charts
      // Note: This logic follows TrainingReasonsNotMoreByAge which uses totalValidResponses
      const pct = totalValidResponses > 0 ? (count / totalValidResponses) * 100 : 0;
      items.push({ label: `${role}<br>${reasonLabel}`, value: pct });
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
const processNoTrainingReasonsByRole: ChartProcessor = (responses, palette) => {
  const roleReasonsStats = new Map<string, Map<string, number>>();
  const roleAnsweredTotals = new Map<string, number>();

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // 1. Parse Data
  responses.forEach((r) => {
    const role = normalize(r.raw.role ?? '');

    // No filter on participatedInTraining as per NoTrainingReasons.tsx logic

    if (!role || role.toLowerCase() === 'n/a') {
      return;
    }

    if (!roleReasonsStats.has(role)) {
      roleReasonsStats.set(role, new Map());
      roleAnsweredTotals.set(role, 0);
    }

    // Answered (Numerator) & Reasons
    if (hasValidNoTrainingReasonAnswer(r)) {
      roleAnsweredTotals.set(role, (roleAnsweredTotals.get(role) ?? 0) + 1);

      const reasons = roleReasonsStats.get(role)!;

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

  // 2. Sort & Filter (Sort by number of respondents who answered)
  const sortedRoles = Array.from(roleAnsweredTotals.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([role]) => role);

  const totalAnswered = Array.from(roleAnsweredTotals.values()).reduce((a, b) => a + b, 0);

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
export const NoTrainingReasonsByRole = ({
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
        y: 1.1, // Position legend above chart
        xanchor: 'right',
        x: 1,
        traceorder: 'normal',
      },
    }),
    []
  );

  return (
    <GenericChart
      graphId="NoTrainingReasonsByRole"
      processor={processNoTrainingReasonsByRole}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
      dataExtractor={extractNoTrainingReasonsByRoleData}
      comparisonStrategy={comparisonStrategy}
    />
  );
};
