import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor, type DataExtractor } from '../../components/GraphViews';
import type { SurveyResponse } from '../../data/data-parsing-logic/SurveyResponse';
import { createDumbbellComparisonStrategy } from '../../components/comparision-components/DumbbellComparisonStrategy';
import type { HorizontalBarData } from '../../components/comparision-components/HorizontalBarComparisonStrategy';

// --- Constants & Helpers ---
const DIMENSIONS_TEMPLATE = [
  { key: 'roleConsiderEnvironmental', label: 'Environmental' },
  { key: 'roleConsiderSocial', label: 'Social' },
  { key: 'roleConsiderIndividual', label: 'Individual' },
  { key: 'roleConsiderEconomic', label: 'Economic' },
  { key: 'roleConsiderTechnical', label: 'Technical' },
  { key: 'roleConsiderOther', label: 'Other' },
];

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

// --- Data Extractor for Comparison ---
const sustainabilityDimensionsByRoleExtractor: DataExtractor<HorizontalBarData> = (responses) => {
  const roleStats = new Map<string, Map<string, number>>();
  let totalEligible = 0; // Denominator: People who incorporate sustainability

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  responses.forEach((r) => {
    // Precondition 1: Must incorporate sustainability
    if (norm(r.raw.personIncorporatesSustainability) !== 'yes') {
      return;
    }

    totalEligible++;

    // Precondition 2: Valid Role
    const role = normalize(r.raw.role ?? '');
    if (!role || role.toLowerCase() === 'n/a') return;

    if (!roleStats.has(role)) {
      roleStats.set(role, new Map());
    }
    const stats = roleStats.get(role)!;

    // Count Dimensions
    DIMENSIONS_TEMPLATE.forEach((dimDef) => {
      let isSelected = false;
      if (dimDef.key === 'roleConsiderOther') {
        const otherValue = norm(r.raw.roleConsiderOther);
        isSelected = otherValue.length > 0 && otherValue !== 'n/a';
      } else {
        isSelected = norm(r.raw[dimDef.key as keyof typeof r.raw]) === 'yes';
      }

      if (isSelected) {
        stats.set(dimDef.label, (stats.get(dimDef.label) ?? 0) + 1);
      }
    });
  });

  const items: { label: string; value: number }[] = [];

  roleStats.forEach((dimMap, role) => {
    dimMap.forEach((count, dimLabel) => {
      // Return raw count. Strategy will divide by totalEligible.
      items.push({
        label: `${role} - ${dimLabel}`,
        value: count,
      });
    });
  });

  return {
    items,
    stats: {
      numberOfResponses: totalEligible,
      totalEligible: totalEligible,
    },
  };
};

// --- Comparison Strategy ---
const baseComparisonStrategy = createDumbbellComparisonStrategy({
  normalizeToPercentage: true, // Divides raw count by totalEligible
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
    // Dynamic height adjustment
    const itemCount = (result.traces[1] as Data & { y: string[] }).y?.length || 0;
    const dynamicHeight = Math.max(520, itemCount * 35 + 100);

    result.layout.height = dynamicHeight;

    // Ensure labels are readable (Role names can be long)
    result.layout.margin = {
      ...(result.layout.margin || {}),
      l: 250,
    };
  }

  return result;
};

// --- Original Processor Logic (Kept for Single Year View) ---
const hasValidDimensionAnswer = (r: SurveyResponse): boolean => {
  const raw = r.raw;
  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  if (norm(raw.personIncorporatesSustainability) !== 'yes') return false;

  if (norm(raw.roleConsiderEnvironmental) === 'yes') return true;
  if (norm(raw.roleConsiderSocial) === 'yes') return true;
  if (norm(raw.roleConsiderIndividual) === 'yes') return true;
  if (norm(raw.roleConsiderEconomic) === 'yes') return true;
  if (norm(raw.roleConsiderTechnical) === 'yes') return true;

  const oVal = norm(raw.roleConsiderOther);
  if (oVal.length > 0 && oVal !== 'n/a') return true;

  return true;
};

const processSustainabilityDimensionsInTasksByRole: ChartProcessor = (responses, palette) => {
  const roleStats = new Map<string, Map<string, number>>();
  const roleEligibleTotals = new Map<string, number>();
  const roleAnsweredTotals = new Map<string, number>();

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  responses.forEach((r) => {
    const role = normalize(r.raw.role ?? '');
    if (!role || role.toLowerCase() === 'n/a') return;
    if (norm(r.raw.personIncorporatesSustainability) !== 'yes') return;

    if (!roleStats.has(role)) {
      roleStats.set(role, new Map());
      roleEligibleTotals.set(role, 0);
      roleAnsweredTotals.set(role, 0);
    }

    roleEligibleTotals.set(role, (roleEligibleTotals.get(role) ?? 0) + 1);

    if (hasValidDimensionAnswer(r)) {
      roleAnsweredTotals.set(role, (roleAnsweredTotals.get(role) ?? 0) + 1);
      const stats = roleStats.get(role)!;

      DIMENSIONS_TEMPLATE.forEach((dimDef) => {
        let isSelected = false;
        if (dimDef.key === 'roleConsiderOther') {
          const otherValue = norm(r.raw.roleConsiderOther);
          isSelected = otherValue.length > 0 && otherValue !== 'n/a';
        } else {
          isSelected = norm(r.raw[dimDef.key as keyof typeof r.raw]) === 'yes';
        }

        if (isSelected) {
          stats.set(dimDef.label, (stats.get(dimDef.label) ?? 0) + 1);
        }
      });
    }
  });

  const sortedRoles = Array.from(roleEligibleTotals.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([role]) => role);

  const totalEligible = Array.from(roleEligibleTotals.values()).reduce((a, b) => a + b, 0);
  const totalAnswered = Array.from(roleAnsweredTotals.values()).reduce((a, b) => a + b, 0);

  const dimColors: Record<string, string> = {
    Environmental: palette.spring,
    Social: palette.mandarin,
    Individual: palette.berry,
    Economic: palette.transport,
    Technical: palette.grey02,
    Other: palette.grey,
  };

  const traces: Data[] = DIMENSIONS_TEMPLATE.map((dimDef) => {
    const label = dimDef.label;
    const xValues = sortedRoles.map((role) => roleStats.get(role)?.get(label) ?? 0);

    return {
      type: 'bar',
      name: label,
      orientation: 'h',
      y: sortedRoles,
      x: xValues,
      marker: {
        color: dimColors[label] || palette.grey,
      },
      text: xValues.map((v) => (v > 0 ? v.toString() : '')),
      textposition: 'inside',
      insidetextanchor: 'middle',
      textfont: {
        family: 'PP Mori, sans-serif',
        size: 13,
        color: '#FFFFFF',
      },
      hovertemplate: '%{x} responses<extra></extra>',
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
export const SustainabilityDimensionsInTasksByRole = ({
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
      margin: { t: 40, r: 20, b: 60, l: 200 },
      uniformtext: { mode: 'show', minsize: 10 },
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
      graphId="SustainabilityDimensionsInTasksByRole"
      processor={processSustainabilityDimensionsInTasksByRole}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
      dataExtractor={sustainabilityDimensionsByRoleExtractor}
      comparisonStrategy={comparisonStrategy}
    />
  );
};
