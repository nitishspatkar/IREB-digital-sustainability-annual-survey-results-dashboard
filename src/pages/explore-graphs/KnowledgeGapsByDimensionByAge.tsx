import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor } from '../../components/GraphViews';
import type { SurveyResponse } from '../../data/data-parsing-logic/SurveyResponse';

// --- Constants & Helpers ---
const DIMENSIONS_TEMPLATE = [
  { key: 'lackKnowledgeEnvironmental', label: 'Environmental' },
  { key: 'lackKnowledgeSocial', label: 'Social' },
  { key: 'lackKnowledgeIndividual', label: 'Individual' },
  { key: 'lackKnowledgeEconomic', label: 'Economic' },
  { key: 'lackKnowledgeTechnical', label: 'Technical' },
  { key: 'lackKnowledgeNone', label: 'Sufficient resources' },
];

const AGE_ORDER = ['18-28', '29-39', '40-50', '51-60', '60+'];

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

// Check if user provided at least one dimension or explicitly said "None" (Sufficient)
const hasValidDimensionAnswer = (r: SurveyResponse): boolean => {
  const raw = r.raw;
  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  if (norm(raw.lackKnowledgeEnvironmental) === 'yes') return true;
  if (norm(raw.lackKnowledgeSocial) === 'yes') return true;
  if (norm(raw.lackKnowledgeIndividual) === 'yes') return true;
  if (norm(raw.lackKnowledgeEconomic) === 'yes') return true;
  if (norm(raw.lackKnowledgeTechnical) === 'yes') return true;
  if (norm(raw.lackKnowledgeNone) === 'yes') return true;

  // Also count as valid if all are explicitly 'no' (matching main graph logic)
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

  // Note: 'lackKnowledgeOther' exists but usually we focus on the main ones or strict explicit answers.
  // The inspiration file checked 'Other'. Let's check 'Other' too to be safe.
  const oVal = norm(raw.lackKnowledgeOther);
  if (oVal.length > 0 && oVal !== 'n/a') return true;

  return false;
};

// --- The Processor Logic ---
const processKnowledgeGapsByDimensionByAge: ChartProcessor = (responses, palette) => {
  const groupStats = new Map<string, Map<string, number>>();
  const groupEligibleTotals = new Map<string, number>();
  const groupAnsweredTotals = new Map<string, number>();

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // 1. Parse Data
  responses.forEach((r) => {
    let age = normalize(r.raw.ageGroup ?? '');

    // Normalize age labels if needed (e.g. removing " years")
    age = age.replace(' years', '').trim();

    if (!age || age.toLowerCase() === 'n/a' || age === '') {
      return;
    }

    if (!groupStats.has(age)) {
      groupStats.set(age, new Map());
      groupEligibleTotals.set(age, 0);
      groupAnsweredTotals.set(age, 0);
    }

    // Eligible (everyone in this age group)
    groupEligibleTotals.set(age, (groupEligibleTotals.get(age) ?? 0) + 1);

    // Answered (Numerator) & Dimensions
    if (hasValidDimensionAnswer(r)) {
      groupAnsweredTotals.set(age, (groupAnsweredTotals.get(age) ?? 0) + 1);
      const stats = groupStats.get(age)!;

      DIMENSIONS_TEMPLATE.forEach((dimDef) => {
        const isSelected = norm(r.raw[dimDef.key as keyof typeof r.raw]) === 'yes';
        if (isSelected) {
          stats.set(dimDef.label, (stats.get(dimDef.label) ?? 0) + 1);
        }
      });
    }
  });

  // 2. Sort Groups
  const sortedGroups = Array.from(groupEligibleTotals.keys()).sort((a, b) => {
    const idxA = AGE_ORDER.indexOf(a);
    const idxB = AGE_ORDER.indexOf(b);
    // If not in predefined order, sort alphabetically at the end
    if (idxA === -1 && idxB === -1) return a.localeCompare(b);
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  const totalEligible = Array.from(groupEligibleTotals.values()).reduce((a, b) => a + b, 0);
  const totalAnswered = Array.from(groupAnsweredTotals.values()).reduce((a, b) => a + b, 0);

  // 3. Define Colors
  const dimColors: Record<string, string> = {
    Environmental: palette.spring,
    Social: palette.mandarin,
    Individual: palette.berry,
    Economic: palette.transport,
    Technical: palette.grey02,
    'Sufficient resources': palette.grey, // Using grey for "Sufficient/None"
  };

  // 4. Build Traces
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
      numberOfResponses: totalAnswered,
      totalEligible: totalEligible,
    },
    traces: traces,
  };
};

// --- The Component ---
export const KnowledgeGapsByDimensionByAge = ({
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
      },
    }),
    []
  );

  return (
    <GenericChart
      graphId="KnowledgeGapsByDimensionByAge"
      processor={processKnowledgeGapsByDimensionByAge}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
    />
  );
};
