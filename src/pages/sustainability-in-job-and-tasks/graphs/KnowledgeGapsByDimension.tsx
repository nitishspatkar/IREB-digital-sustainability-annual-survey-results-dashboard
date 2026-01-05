import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';

import { GenericChart, type ChartProcessor } from '../../../components/GraphViews';
import { KnowledgeGapsByDimensionOther } from '../../explore-graphs/KnowledgeGapsByDimensionOther';

// --- PROCESSOR ---
const knowledgeGapsProcessor: ChartProcessor = (responses, palette) => {
  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  let environmental = 0;
  let social = 0;
  let individual = 0;
  let economic = 0;
  let technical = 0;
  let none = 0;
  let other = 0;
  let numberOfRespondents = 0;

  responses.forEach((r) => {
    const raw = r.raw;
    let hasAnswer = false;

    if (norm(raw.lackKnowledgeEnvironmental) === 'yes') {
      environmental += 1;
      hasAnswer = true;
    }
    if (norm(raw.lackKnowledgeSocial) === 'yes') {
      social += 1;
      hasAnswer = true;
    }
    if (norm(raw.lackKnowledgeIndividual) === 'yes') {
      individual += 1;
      hasAnswer = true;
    }
    if (norm(raw.lackKnowledgeEconomic) === 'yes') {
      economic += 1;
      hasAnswer = true;
    }
    if (norm(raw.lackKnowledgeTechnical) === 'yes') {
      technical += 1;
      hasAnswer = true;
    }
    if (norm(raw.lackKnowledgeNone) === 'yes') {
      none += 1;
      hasAnswer = true;
    }

    if (
      norm(raw.lackKnowledgeEnvironmental) === 'no' &&
      norm(raw.lackKnowledgeSocial) === 'no' &&
      norm(raw.lackKnowledgeIndividual) === 'no' &&
      norm(raw.lackKnowledgeEconomic) === 'no' &&
      norm(raw.lackKnowledgeTechnical) === 'no' &&
      norm(raw.lackKnowledgeNone) === 'no'
    ) {
      hasAnswer = true;
    }

    const otherVal = norm(raw.lackKnowledgeOther);
    if (otherVal.length > 0 && otherVal !== 'n/a') {
      other += 1;
      hasAnswer = true;
    }

    if (hasAnswer) {
      numberOfRespondents += 1;
    }
  });

  const items = [
    { label: 'Environmental', value: environmental },
    { label: 'Social', value: social },
    { label: 'Individual', value: individual },
    { label: 'Economic', value: economic },
    { label: 'Technical', value: technical },
    { label: 'None', value: none },
    { label: 'Other', value: other },
  ];

  // Sort ascending by value for horizontal chart
  items.sort((a, b) => a.value - b.value);

  const traces: Data[] = [
    {
      type: 'bar',
      orientation: 'h',
      x: items.map((i) => i.value),
      y: items.map((i) => i.label),
      marker: { color: palette.berry },
      text: items.map((i) => i.value.toString()),
      textposition: 'outside',
      textfont: {
        family: 'PP Mori, sans-serif',
        size: 12,
        color: palette.grey,
      },
      cliponaxis: false,
      hoverinfo: 'none',
    },
  ];

  return {
    traces,
    stats: {
      numberOfResponses: numberOfRespondents,
    },
  };
};

// --- COMPONENT 1: Main Chart ---
export const KnowledgeGapsByDimension = ({ onExplore }: { onExplore?: () => void }) => {
  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 50, r: 40, b: 60, l: 120 }, // Preserved margin
    }),
    []
  );

  return (
    <GenericChart
      graphId="KnowledgeGapsByDimension"
      processor={knowledgeGapsProcessor}
      layout={layout}
      exploreComponents={[KnowledgeGapsByDimensionOther]}
      onExplore={onExplore}
    />
  );
};

// --- COMPONENT 2: Detail List ---
export const KnowledgeGapsByDimensionDetails = ({ onBack }: { onBack: () => void }) => {
  return <KnowledgeGapsByDimensionOther onBack={onBack} />;
};

export default KnowledgeGapsByDimension;
