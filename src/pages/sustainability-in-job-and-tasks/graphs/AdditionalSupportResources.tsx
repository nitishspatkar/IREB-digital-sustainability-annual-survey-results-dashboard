import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';

import {
  GenericChart,
  type ChartProcessor,
  type DataExtractor,
} from '../../../components/GraphViews';
import { AdditionalSupportResourcesOther } from '../../explore-graphs/AdditionalSupportResourcesOther';
import { AdditionalSupportResourcesByTraining } from '../../explore-graphs/AdditionalSupportResourcesByTraining';
import { AdditionalSupportResourcesByAge } from '../../explore-graphs/AdditionalSupportResourcesByAge';
import { AdditionalSupportResourcesByRole } from '../../explore-graphs/AdditionalSupportResourcesByRole';
import { AdditionalSupportResourcesByOrgType } from '../../explore-graphs/AdditionalSupportResourcesByOrgType';
import { type HorizontalBarData } from '../../../components/comparision-components/HorizontalBarComparisonStrategy';
import { scatterPlotComparisonStrategy } from '../../../components/comparision-components/ScatterPlotComparisonStrategy';

// --- DATA EXTRACTOR ---
const additionalSupportResourcesDataExtractor: DataExtractor<HorizontalBarData> = (responses) => {
  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  let theoretical = 0;
  let tutorials = 0;
  let curricula = 0;
  let practical = 0;
  let caseStudies = 0;
  let structures = 0;
  let tools = 0;
  let none = 0;
  let other = 0;
  let numberOfRespondents = 0;

  responses.forEach((r) => {
    const raw = r.raw;
    let hasAnswer = false;

    if (norm(raw.supportNeedTheoretical) === 'yes') {
      theoretical += 1;
      hasAnswer = true;
    }
    if (norm(raw.supportNeedTutorials) === 'yes') {
      tutorials += 1;
      hasAnswer = true;
    }
    if (norm(raw.supportNeedCurricula) === 'yes') {
      curricula += 1;
      hasAnswer = true;
    }
    if (norm(raw.supportNeedPractical) === 'yes') {
      practical += 1;
      hasAnswer = true;
    }
    if (norm(raw.supportNeedCaseStudies) === 'yes') {
      caseStudies += 1;
      hasAnswer = true;
    }
    if (norm(raw.supportNeedStructures) === 'yes') {
      structures += 1;
      hasAnswer = true;
    }
    if (norm(raw.supportNeedTools) === 'yes') {
      tools += 1;
      hasAnswer = true;
    }
    if (norm(raw.supportNeedNone) === 'yes') {
      none += 1;
      hasAnswer = true;
    }

    if (
      norm(raw.supportNeedTheoretical) === 'no' &&
      norm(raw.supportNeedTutorials) === 'no' &&
      norm(raw.supportNeedCurricula) === 'no' &&
      norm(raw.supportNeedPractical) === 'no' &&
      norm(raw.supportNeedCaseStudies) === 'no' &&
      norm(raw.supportNeedStructures) === 'no' &&
      norm(raw.supportNeedTools) === 'no' &&
      norm(raw.supportNeedNone) === 'no'
    ) {
      hasAnswer = true;
    }

    const otherVal = norm(raw.supportNeedOther);
    if (otherVal.length > 0 && otherVal !== 'n/a') {
      other += 1;
      hasAnswer = true;
    }

    if (hasAnswer) numberOfRespondents += 1;
  });

  const items = [
    { label: 'Theoretical knowledge (self-study)', value: theoretical },
    { label: 'Tutorials (training)', value: tutorials },
    { label: 'Curricula (programs)', value: curricula },
    { label: "Practical knowledge (how-to's)", value: practical },
    { label: 'Positive case studies', value: caseStudies },
    { label: 'Structures (frameworks/standards)', value: structures },
    { label: 'Tools (checklists/methods)', value: tools },
    { label: 'No additional support needed', value: none },
    { label: 'Other', value: other },
  ];

  return {
    items,
    stats: {
      numberOfResponses: numberOfRespondents,
    },
  };
};

// --- PROCESSOR ---
const additionalSupportResourcesProcessor: ChartProcessor = (responses, palette) => {
  const data = additionalSupportResourcesDataExtractor(responses);

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
export const AdditionalSupportResources = ({ onExplore }: { onExplore?: () => void }) => {
  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 50, r: 40, b: 60, l: 250 }, // Preserved specific margin
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
      graphId="AdditionalSupportResources"
      processor={additionalSupportResourcesProcessor}
      layout={layout}
      exploreComponents={[
        AdditionalSupportResourcesOther,
        AdditionalSupportResourcesByTraining,
        AdditionalSupportResourcesByAge,
        AdditionalSupportResourcesByRole,
        AdditionalSupportResourcesByOrgType,
      ]}
      onExplore={onExplore}
      dataExtractor={additionalSupportResourcesDataExtractor}
      comparisonStrategy={scatterPlotComparisonStrategy}
    />
  );
};

// --- COMPONENT 2: Detail List ---
export const AdditionalSupportResourcesDetails = ({ onBack }: { onBack: () => void }) => {
  return <AdditionalSupportResourcesOther onBack={onBack} />;
};

export default AdditionalSupportResources;
