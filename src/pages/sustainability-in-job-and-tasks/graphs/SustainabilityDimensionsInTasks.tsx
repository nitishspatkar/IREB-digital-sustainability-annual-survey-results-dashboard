import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';

import {
  GenericChart,
  type ChartProcessor,
  type DataExtractor,
} from '../../../components/GraphViews';
import { SustainabilityDimensionsInTasksOther } from '../../explore-graphs/SustainabilityDimensionsInTasksOther';
import {
  horizontalBarComparisonStrategy,
  type HorizontalBarData,
} from '../../../components/comparision-components/HorizontalBarComparisonStrategy';
import { SustainabilityDimensionsByOrgType } from '../../explore-graphs/SustainabilityDimensionsByOrgType';

// --- DATA EXTRACTOR ---
const sustainabilityDimensionsDataExtractor: DataExtractor<HorizontalBarData> = (responses) => {
  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  let environmental = 0;
  let social = 0;
  let individual = 0;
  let economic = 0;
  let technical = 0;
  let other = 0;
  let numberOfRespondents = 0;

  // --- Precondition: Q28 = Yes ---
  const filteredResponses = responses.filter(
    (r) => norm(r.raw.personIncorporatesSustainability) === 'yes'
  );

  filteredResponses.forEach((r) => {
    const raw = r.raw;
    let hasAnswer = false;

    if (norm(raw.roleConsiderEnvironmental) === 'yes') {
      environmental += 1;
      hasAnswer = true;
    }
    if (norm(raw.roleConsiderSocial) === 'yes') {
      social += 1;
      hasAnswer = true;
    }
    if (norm(raw.roleConsiderIndividual) === 'yes') {
      individual += 1;
      hasAnswer = true;
    }
    if (norm(raw.roleConsiderEconomic) === 'yes') {
      economic += 1;
      hasAnswer = true;
    }
    if (norm(raw.roleConsiderTechnical) === 'yes') {
      technical += 1;
      hasAnswer = true;
    }

    if (
      norm(raw.roleConsiderEnvironmental) === 'no' &&
      norm(raw.roleConsiderSocial) === 'no' &&
      norm(raw.roleConsiderIndividual) === 'no' &&
      norm(raw.roleConsiderEconomic) === 'no' &&
      norm(raw.roleConsiderTechnical) === 'no'
    ) {
      hasAnswer = true;
    }

    const otherVal = norm(raw.roleConsiderOther);
    if (otherVal.length > 0 && otherVal !== 'n/a') {
      other += 1;
      hasAnswer = true;
    }

    if (hasAnswer) numberOfRespondents += 1;
  });

  const items = [
    { label: 'Environmental', value: environmental },
    { label: 'Social', value: social },
    { label: 'Individual', value: individual },
    { label: 'Economic', value: economic },
    { label: 'Technical', value: technical },
    { label: 'Other', value: other },
  ];

  return {
    items,
    stats: {
      numberOfResponses: numberOfRespondents,
      totalEligible: filteredResponses.length,
    },
  };
};

// --- PROCESSOR ---
const sustainabilityDimensionsProcessor: ChartProcessor = (responses, palette) => {
  const data = sustainabilityDimensionsDataExtractor(responses);

  // Sort ascending by value for horizontal chart
  const sortedItems = [...data.items].sort((a, b) => a.value - b.value);

  const traces: Data[] = [
    {
      type: 'bar',
      orientation: 'h',
      x: sortedItems.map((i) => i.value),
      y: sortedItems.map((i) => i.label),
      marker: { color: palette.berry },
      text: sortedItems.map((i) => i.value.toString()),
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
    stats: data.stats,
  };
};

// --- COMPONENT 1: Main Chart ---
export const SustainabilityDimensionsInTasks = ({ onExplore }: { onExplore?: () => void }) => {
  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 50, r: 40, b: 60, l: 120 }, // Preserved margin
      xaxis: {
        title: {
          text: 'Number of Respondents',
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
      graphId="SustainabilityDimensionsInTasks"
      processor={sustainabilityDimensionsProcessor}
      layout={layout}
      exploreComponents={[SustainabilityDimensionsInTasksOther, SustainabilityDimensionsByOrgType]}
      onExplore={onExplore}
      dataExtractor={sustainabilityDimensionsDataExtractor}
      comparisonStrategy={horizontalBarComparisonStrategy}
    />
  );
};

export default SustainabilityDimensionsInTasks;
