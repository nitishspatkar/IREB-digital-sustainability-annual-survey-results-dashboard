import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor, type DataExtractor } from '../../components/GraphViews';
import type { SurveyResponse } from '../../data/data-parsing-logic/SurveyResponse';
import { createDumbbellComparisonStrategy } from '../../components/comparision-components/DumbbellComparisonStrategy';
import type { HorizontalBarData } from '../../components/comparision-components/HorizontalBarComparisonStrategy';

// --- Constants & Helpers ---
const DIMENSIONS_TEMPLATE = [
  { key: 'lackKnowledgeEnvironmental', label: 'Environmental' },
  { key: 'lackKnowledgeSocial', label: 'Social' },
  { key: 'lackKnowledgeIndividual', label: 'Individual' },
  { key: 'lackKnowledgeEconomic', label: 'Economic' },
  { key: 'lackKnowledgeTechnical', label: 'Technical' },
  { key: 'lackKnowledgeNone', label: 'Sufficient resources' },
];

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

const hasValidDimensionAnswer = (r: SurveyResponse): boolean => {
  const raw = r.raw;
  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  if (norm(raw.lackKnowledgeEnvironmental) === 'yes') return true;
  if (norm(raw.lackKnowledgeSocial) === 'yes') return true;
  if (norm(raw.lackKnowledgeIndividual) === 'yes') return true;
  if (norm(raw.lackKnowledgeEconomic) === 'yes') return true;
  if (norm(raw.lackKnowledgeTechnical) === 'yes') return true;
  if (norm(raw.lackKnowledgeNone) === 'yes') return true;

  if (
    norm(raw.lackKnowledgeEnvironmental) === 'no' &&
    norm(raw.lackKnowledgeSocial) === 'no' &&
    norm(raw.lackKnowledgeIndividual) === 'no' &&
    norm(raw.lackKnowledgeEconomic) === 'no' &&
    norm(raw.lackKnowledgeTechnical) === 'no' &&
    norm(raw.lackKnowledgeNone) === 'no'
  ) {
    return true;
  }

  const oVal = norm(raw.lackKnowledgeOther);
  if (oVal.length > 0 && oVal !== 'n/a') return true;

  return false;
};

const sortExperience = (aLabel: string, bLabel: string) => {
  const aMatch = aLabel.match(/^(\d+)/);
  const bMatch = bLabel.match(/^(\d+)/);

  if (aLabel.startsWith('Less than')) return -1;
  if (bLabel.startsWith('Less than')) return 1;
  if (aLabel.startsWith('More than')) return 1;
  if (bLabel.startsWith('More than')) return -1;
  if (aMatch && bMatch) return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
  return aLabel.localeCompare(bLabel);
};

// --- Comparison Strategy & Data Extractor ---

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
      dtick: 1,
    };
    result.layout.xaxis = {
      ...result.layout.xaxis,
      automargin: true,
      title: {
        ...(result.layout.xaxis?.title || {}),
        standoff: 20,
      },
    };

    const itemCount = (result.traces[1] as Data & { y: string[] }).y?.length || 0;
    const dynamicHeight = Math.max(520, itemCount * 50 + 100);
    result.layout.height = dynamicHeight;
  }

  return result;
};

const extractKnowledgeGapsByDimensionByExperienceData: DataExtractor<HorizontalBarData> = (
  responses
) => {
  const groupStats = new Map<string, Map<string, number>>();
  const groupTotals = new Map<string, number>();
  let totalValidResponses = 0; // Global denominator

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // First pass: Calculate global denominator (total valid responses across all groups)
  responses.forEach((r) => {
    if (hasValidDimensionAnswer(r)) {
      totalValidResponses++;
    }
  });

  // Second pass: Populate groups
  responses.forEach((r) => {
    // Only process if valid answer (to be consistent with denominator population)
    if (!hasValidDimensionAnswer(r)) return;

    let exp = normalize(r.raw.professionalExperienceYears ?? '');
    exp = exp.replace(' years', '').trim();

    if (!exp || exp.toLowerCase() === 'n/a' || exp === '') return;

    if (!groupStats.has(exp)) {
      groupStats.set(exp, new Map());
      groupTotals.set(exp, 0);
    }

    groupTotals.set(exp, (groupTotals.get(exp) ?? 0) + 1);

    const stats = groupStats.get(exp)!;
    DIMENSIONS_TEMPLATE.forEach((dimDef) => {
      const isSelected = norm(r.raw[dimDef.key as keyof typeof r.raw]) === 'yes';
      if (isSelected) {
        stats.set(dimDef.label, (stats.get(dimDef.label) ?? 0) + 1);
      }
    });
  });

  const items: { label: string; value: number }[] = [];

  groupStats.forEach((stats, exp) => {
    // Note: totalInGroup is unused for pct calc here, we use totalValidResponses
    stats.forEach((count, dimLabel) => {
      // Percentage = (Count in Group / Total Global Valid Responses) * 100
      const pct = totalValidResponses > 0 ? (count / totalValidResponses) * 100 : 0;
      items.push({
        label: `${exp}<br>${dimLabel}`,
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

// --- The Processor Logic ---
const processKnowledgeGapsByDimensionByExperience: ChartProcessor = (responses, palette) => {
  const groupStats = new Map<string, Map<string, number>>();
  const groupTotals = new Map<string, number>(); // Used for sorting mostly
  let totalValidResponses = 0; // Global denominator

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // 1. Calculate Global Denominator
  responses.forEach((r) => {
    if (hasValidDimensionAnswer(r)) {
      totalValidResponses++;
    }
  });

  // 2. Parse Data
  responses.forEach((r) => {
    if (!hasValidDimensionAnswer(r)) return;

    let exp = normalize(r.raw.professionalExperienceYears ?? '');
    exp = exp.replace(' years', '').trim();

    if (!exp || exp.toLowerCase() === 'n/a' || exp === '') {
      return;
    }

    if (!groupStats.has(exp)) {
      groupStats.set(exp, new Map());
      groupTotals.set(exp, 0);
    }

    groupTotals.set(exp, (groupTotals.get(exp) ?? 0) + 1);
    const stats = groupStats.get(exp)!;

    DIMENSIONS_TEMPLATE.forEach((dimDef) => {
      const isSelected = norm(r.raw[dimDef.key as keyof typeof r.raw]) === 'yes';
      if (isSelected) {
        stats.set(dimDef.label, (stats.get(dimDef.label) ?? 0) + 1);
      }
    });
  });

  // 3. Sort Groups
  const sortedGroups = Array.from(groupTotals.keys()).sort((a, b) => sortExperience(a, b));

  // 4. Define Colors
  const dimColors: Record<string, string> = {
    Environmental: palette.spring,
    Social: palette.mandarin,
    Individual: palette.berry,
    Economic: palette.transport,
    Technical: palette.grey02,
    'Sufficient resources': palette.grey,
  };

  // 5. Build Traces
  const traces: Data[] = DIMENSIONS_TEMPLATE.map((dimDef) => {
    const label = dimDef.label;
    const xValues = sortedGroups.map((g) => groupStats.get(g)?.get(label) ?? 0);

    return {
      type: 'bar',
      name: label,
      orientation: 'h',
      y: sortedGroups,
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
      hoverinfo: 'x+y+name',
    };
  });

  return {
    stats: {
      numberOfResponses: totalValidResponses,
      totalEligible: totalValidResponses,
    },
    traces: traces,
  };
};

// --- The Component ---
export const KnowledgeGapsByDimensionByExperience = ({
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
      margin: { t: 40, r: 20, b: 60, l: 150 },
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
      graphId="KnowledgeGapsByDimensionByExperience"
      processor={processKnowledgeGapsByDimensionByExperience}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
      dataExtractor={extractKnowledgeGapsByDimensionByExperienceData}
      comparisonStrategy={comparisonStrategy}
    />
  );
};
