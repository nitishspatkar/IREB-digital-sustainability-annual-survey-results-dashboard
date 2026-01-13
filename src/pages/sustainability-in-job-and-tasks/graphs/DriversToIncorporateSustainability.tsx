import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';

import {
  GenericChart,
  type ChartProcessor,
  type DataExtractor,
} from '../../../components/GraphViews';
import { DriversToIncorporateSustainabilityOther } from '../../explore-graphs/DriversToIncorporateSustainabilityOther';
import { DriversToIncorporateSustainabilityByOrgType } from '../../explore-graphs/DriversToIncorporateSustainabilityByOrgType';
import {
  horizontalBarComparisonStrategy,
  type HorizontalBarData,
} from '../../../components/comparision-components/HorizontalBarComparisonStrategy';

// --- DATA EXTRACTOR ---
const driversDataExtractor: DataExtractor<HorizontalBarData> = (responses) => {
  const normalize = (v: string) => v?.trim().toLowerCase() ?? '';

  let orgPolicies = 0;
  let personalBeliefs = 0;
  let clientReqs = 0;
  let userReqs = 0;
  let legalReqs = 0;
  let other = 0;
  let respondentsWithAnyAnswer = 0;

  // --- Precondition: Q28 = Yes ---
  const filteredResponses = responses.filter(
    (r) => normalize(r.raw.personIncorporatesSustainability) === 'yes'
  );

  filteredResponses.forEach((response) => {
    const raw = response.raw;
    let hasAnswer = false;

    if (normalize(raw.driveOrganizationalPolicies) === 'yes') {
      orgPolicies += 1;
      hasAnswer = true;
    }
    if (normalize(raw.drivePersonalBeliefs) === 'yes') {
      personalBeliefs += 1;
      hasAnswer = true;
    }
    if (normalize(raw.driveClientRequirements) === 'yes') {
      clientReqs += 1;
      hasAnswer = true;
    }
    if (normalize(raw.driveUserRequirements) === 'yes') {
      userReqs += 1;
      hasAnswer = true;
    }
    if (normalize(raw.driveLegalRequirements) === 'yes') {
      legalReqs += 1;
      hasAnswer = true;
    }

    if (
      normalize(raw.driveOrganizationalPolicies) === 'no' &&
      normalize(raw.drivePersonalBeliefs) === 'no' &&
      normalize(raw.driveClientRequirements) === 'no' &&
      normalize(raw.driveUserRequirements) === 'no' &&
      normalize(raw.driveLegalRequirements) === 'no'
    ) {
      hasAnswer = true;
    }

    const otherVal = normalize(raw.driveOther);
    if (otherVal.length > 0 && otherVal !== 'n/a') {
      other += 1;
      hasAnswer = true;
    }

    if (hasAnswer) respondentsWithAnyAnswer += 1;
  });

  const items = [
    { label: 'Organizational policies', value: orgPolicies },
    { label: 'Personal beliefs', value: personalBeliefs },
    { label: 'Client requirements', value: clientReqs },
    { label: 'User requirements', value: userReqs },
    { label: 'Legal requirements', value: legalReqs },
    { label: 'Other', value: other },
  ];

  return {
    items,
    stats: {
      numberOfResponses: respondentsWithAnyAnswer,
      totalEligible: filteredResponses.length,
    },
  };
};

// --- PROCESSOR ---
const driversProcessor: ChartProcessor = (responses, palette) => {
  const data = driversDataExtractor(responses);

  // Sort ascending by value
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
export const DriversToIncorporateSustainability = ({ onExplore }: { onExplore?: () => void }) => {
  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 50, r: 40, b: 60, l: 180 },
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
      graphId="DriversToIncorporateSustainability"
      processor={driversProcessor}
      layout={layout}
      exploreComponents={[
        DriversToIncorporateSustainabilityOther,
        DriversToIncorporateSustainabilityByOrgType,
      ]}
      onExplore={onExplore}
      dataExtractor={driversDataExtractor}
      comparisonStrategy={horizontalBarComparisonStrategy}
    />
  );
};

// --- COMPONENT 2: Detail List ---
export const DriversToIncorporateSustainabilityDetails = ({ onBack }: { onBack: () => void }) => {
  return <DriversToIncorporateSustainabilityOther onBack={onBack} />;
};

export default DriversToIncorporateSustainability;
