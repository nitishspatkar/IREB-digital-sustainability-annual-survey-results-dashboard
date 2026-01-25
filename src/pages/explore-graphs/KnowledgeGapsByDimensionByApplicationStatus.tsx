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

const CATEGORIES = ['Applies sustainability', 'Does not apply sustainability'];

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

const extractKnowledgeGapsByDimensionByApplicationStatusData: DataExtractor<HorizontalBarData> = (
  responses
) => {
  const statsMap = new Map<string, Map<string, number>>();
  CATEGORIES.forEach((cat) => statsMap.set(cat, new Map()));

  let totalValidResponses = 0; // Global denominator (respondents who answered the knowledge gap question)

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

    // Determine Category
    const incorporates = norm(r.raw.personIncorporatesSustainability) === 'yes';
    const category = incorporates ? CATEGORIES[0] : CATEGORIES[1];

    const catStats = statsMap.get(category)!;

    DIMENSIONS_TEMPLATE.forEach((dimDef) => {
      const isSelected = norm(r.raw[dimDef.key as keyof typeof r.raw]) === 'yes';
      if (isSelected) {
        catStats.set(dimDef.label, (catStats.get(dimDef.label) ?? 0) + 1);
      }
    });
  });

  const items: { label: string; value: number }[] = [];

  statsMap.forEach((stats, category) => {
    stats.forEach((count, dimLabel) => {
      // Percentage relative to TOTAL valid responses (Global Denominator)
      const pct = totalValidResponses > 0 ? (count / totalValidResponses) * 100 : 0;
      items.push({
        label: `${category}<br>${dimLabel}`,
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
const processKnowledgeGapsByDimensionByApplicationStatus: ChartProcessor = (responses, palette) => {
  const statsMap = new Map<string, Map<string, number>>();
  // Initialize map
  CATEGORIES.forEach((cat) => statsMap.set(cat, new Map()));

  let totalAnswered = 0;
  const totalEligible = responses.length;

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // 1. Parse Data
  responses.forEach((r) => {
    // Determine Category
    const incorporates = norm(r.raw.personIncorporatesSustainability) === 'yes';
    const category = incorporates ? CATEGORIES[0] : CATEGORIES[1];

    if (hasValidDimensionAnswer(r)) {
      totalAnswered++;
      const catStats = statsMap.get(category)!;

      DIMENSIONS_TEMPLATE.forEach((dimDef) => {
        const isSelected = norm(r.raw[dimDef.key as keyof typeof r.raw]) === 'yes';
        if (isSelected) {
          catStats.set(dimDef.label, (catStats.get(dimDef.label) ?? 0) + 1);
        }
      });
    }
  });

  // 2. Build Traces
  const xLabels = DIMENSIONS_TEMPLATE.map((d) => d.label);

  const traces: Data[] = CATEGORIES.map((cat, index) => {
    const yValues = xLabels.map((label) => statsMap.get(cat)?.get(label) ?? 0);

    return {
      type: 'bar',
      name: cat,
      x: xLabels,
      y: yValues,
      text: yValues.map((v) => v.toString()),
      textposition: 'inside',
      insidetextanchor: 'middle',
      textfont: {
        family: 'PP Mori, sans-serif',
        size: 13,
        color: '#FFFFFF',
      },
      marker: {
        color: index === 0 ? palette.spring : palette.mandarin,
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
export const KnowledgeGapsByDimensionByApplicationStatus = ({
  onBack,
  showBackButton = true,
}: {
  onBack: () => void;
  showBackButton?: boolean;
}) => {
  const layout = useMemo<Partial<Layout>>(
    () => ({
      barmode: 'group',
      bargap: 0.15,
      margin: { t: 40, r: 20, b: 60, l: 50 },
      uniformtext: { mode: 'show', minsize: 10 },
      yaxis: {
        title: { text: 'Number of Respondents' },
        automargin: true,
      },
      xaxis: {
        automargin: true,
        tickangle: 0,
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
      graphId="KnowledgeGapsByDimensionByApplicationStatus"
      processor={processKnowledgeGapsByDimensionByApplicationStatus}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
      dataExtractor={extractKnowledgeGapsByDimensionByApplicationStatusData}
      comparisonStrategy={comparisonStrategy}
    />
  );
};
