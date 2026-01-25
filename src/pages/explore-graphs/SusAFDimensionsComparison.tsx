import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor, type DataExtractor } from '../../components/GraphViews';
import type { SurveyRecord } from '../../data/data-parsing-logic/SurveyCsvParser';
import { createDumbbellComparisonStrategy } from '../../components/comparision-components/DumbbellComparisonStrategy';
import type { HorizontalBarData } from '../../components/comparision-components/HorizontalBarComparisonStrategy';

// --- Constants ---
const DIMENSIONS = [
  'Environmental',
  'Social',
  'Individual',
  'Economic',
  'Technical',
  'Sufficient<br>knowledge',
] as const;

type DimensionLabel = (typeof DIMENSIONS)[number];

// Mapping series to data columns
const ORG_MAPPING: Partial<Record<DimensionLabel, keyof SurveyRecord>> = {
  Environmental: 'considerEnvironmental',
  Social: 'considerSocial',
  Individual: 'considerIndividual',
  Economic: 'considerEconomic',
  Technical: 'considerTechnical',
};

const ROLE_MAPPING: Partial<Record<DimensionLabel, keyof SurveyRecord>> = {
  Environmental: 'roleConsiderEnvironmental',
  Social: 'roleConsiderSocial',
  Individual: 'roleConsiderIndividual',
  Economic: 'roleConsiderEconomic',
  Technical: 'roleConsiderTechnical',
};

const LACK_MAPPING: Partial<Record<DimensionLabel, keyof SurveyRecord>> = {
  Environmental: 'lackKnowledgeEnvironmental',
  Social: 'lackKnowledgeSocial',
  Individual: 'lackKnowledgeIndividual',
  Economic: 'lackKnowledgeEconomic',
  Technical: 'lackKnowledgeTechnical',
  'Sufficient<br>knowledge': 'lackKnowledgeNone',
};

const normalize = (value: string | undefined | null) =>
  (value ?? '').replace(/\s+/g, ' ').trim().toLowerCase();

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

const extractSusAFDimensionsComparisonData: DataExtractor<HorizontalBarData> = (responses) => {
  // 1. Calculate Denominators
  const orgPopulation = responses.filter(
    (r) => normalize(r.raw.organizationIncorporatesSustainablePractices) === 'yes'
  ).length;

  const rolePopulation = responses.filter(
    (r) => normalize(r.raw.personIncorporatesSustainability) === 'yes'
  ).length;

  const lackPopulation = responses.filter((r) => {
    const raw = r.raw;
    // Check if they have at least one valid answer in the Lack block
    const hasData = Object.values(LACK_MAPPING).some((col) => {
      const v = normalize(raw[col]);
      return v.length > 0 && v !== 'n/a';
    });
    return hasData;
  }).length;

  // 2. Initialize Counts
  const seriesData = {
    'Development activities': new Map<DimensionLabel, number>(),
    'Role-specific tasks': new Map<DimensionLabel, number>(),
    'Lack knowledge/tools': new Map<DimensionLabel, number>(),
  };

  DIMENSIONS.forEach((dim) => {
    seriesData['Development activities'].set(dim, 0);
    seriesData['Role-specific tasks'].set(dim, 0);
    seriesData['Lack knowledge/tools'].set(dim, 0);
  });

  // 3. Aggregate
  responses.forEach((r) => {
    // Org Series
    if (normalize(r.raw.organizationIncorporatesSustainablePractices) === 'yes') {
      Object.entries(ORG_MAPPING).forEach(([dim, col]) => {
        if (normalize(r.raw[col]) === 'yes') {
          const map = seriesData['Development activities'];
          map.set(dim as DimensionLabel, (map.get(dim as DimensionLabel) ?? 0) + 1);
        }
      });
    }

    // Role Series
    if (normalize(r.raw.personIncorporatesSustainability) === 'yes') {
      Object.entries(ROLE_MAPPING).forEach(([dim, col]) => {
        if (normalize(r.raw[col]) === 'yes') {
          const map = seriesData['Role-specific tasks'];
          map.set(dim as DimensionLabel, (map.get(dim as DimensionLabel) ?? 0) + 1);
        }
      });
    }

    // Lack Series
    Object.entries(LACK_MAPPING).forEach(([dim, col]) => {
      if (normalize(r.raw[col]) === 'yes') {
        const map = seriesData['Lack knowledge/tools'];
        map.set(dim as DimensionLabel, (map.get(dim as DimensionLabel) ?? 0) + 1);
      }
    });
  });

  const items: { label: string; value: number }[] = [];

  // 4. Calculate Percentages and Flatten
  // Series 1: Development activities
  seriesData['Development activities'].forEach((count, dim) => {
    const pct = orgPopulation > 0 ? (count / orgPopulation) * 100 : 0;
    items.push({
      label: `Development activities<br>${dim}`,
      value: pct,
    });
  });

  // Series 2: Role-specific tasks
  seriesData['Role-specific tasks'].forEach((count, dim) => {
    const pct = rolePopulation > 0 ? (count / rolePopulation) * 100 : 0;
    items.push({
      label: `Role-specific tasks<br>${dim}`,
      value: pct,
    });
  });

  // Series 3: Lack knowledge/tools
  seriesData['Lack knowledge/tools'].forEach((count, dim) => {
    const pct = lackPopulation > 0 ? (count / lackPopulation) * 100 : 0;
    items.push({
      label: `Lack knowledge/tools<br>${dim}`,
      value: pct,
    });
  });

  return {
    items,
    stats: {
      numberOfResponses: responses.length,
    },
  };
};

// --- Processor ---

const processData: ChartProcessor = (responses, palette) => {
  // 1. Calculate Denominators
  const orgPopulation = responses.filter(
    (r) => normalize(r.raw.organizationIncorporatesSustainablePractices) === 'yes'
  ).length;

  const rolePopulation = responses.filter(
    (r) => normalize(r.raw.personIncorporatesSustainability) === 'yes'
  ).length;

  const lackPopulation = responses.filter((r) => {
    const raw = r.raw;
    const hasData = Object.values(LACK_MAPPING).some((col) => {
      const v = normalize(raw[col]);
      return v.length > 0 && v !== 'n/a';
    });
    return hasData;
  }).length;

  // 2. Initialize counts
  const seriesData = {
    'Development activities': new Map<DimensionLabel, number>(),
    'Role-specific tasks': new Map<DimensionLabel, number>(),
    'Lack knowledge/tools': new Map<DimensionLabel, number>(),
  };

  DIMENSIONS.forEach((dim) => {
    seriesData['Development activities'].set(dim, 0);
    seriesData['Role-specific tasks'].set(dim, 0);
    seriesData['Lack knowledge/tools'].set(dim, 0);
  });

  // 3. Aggregate
  responses.forEach((r) => {
    if (normalize(r.raw.organizationIncorporatesSustainablePractices) === 'yes') {
      Object.entries(ORG_MAPPING).forEach(([dim, col]) => {
        if (normalize(r.raw[col]) === 'yes') {
          const map = seriesData['Development activities'];
          map.set(dim as DimensionLabel, (map.get(dim as DimensionLabel) ?? 0) + 1);
        }
      });
    }

    if (normalize(r.raw.personIncorporatesSustainability) === 'yes') {
      Object.entries(ROLE_MAPPING).forEach(([dim, col]) => {
        if (normalize(r.raw[col]) === 'yes') {
          const map = seriesData['Role-specific tasks'];
          map.set(dim as DimensionLabel, (map.get(dim as DimensionLabel) ?? 0) + 1);
        }
      });
    }

    Object.entries(LACK_MAPPING).forEach(([dim, col]) => {
      if (normalize(r.raw[col]) === 'yes') {
        const map = seriesData['Lack knowledge/tools'];
        map.set(dim as DimensionLabel, (map.get(dim as DimensionLabel) ?? 0) + 1);
      }
    });
  });

  // Build Traces
  const xValues = [...DIMENSIONS];

  const buildTrace = (name: keyof typeof seriesData, color: string, denominator: number): Data => {
    const yValues = xValues.map((dim) => {
      const count = seriesData[name].get(dim) ?? 0;
      return denominator > 0 ? (count / denominator) * 100 : 0;
    });

    return {
      type: 'bar',
      name: name,
      x: xValues,
      y: yValues,
      marker: { color: color },
      hovertemplate: `<b>${name}</b><br>%{x}: %{y:.1f}% (N=${denominator})<extra></extra>`,
    };
  };

  const traces: Data[] = [
    buildTrace('Development activities', palette.transport, orgPopulation),
    buildTrace('Role-specific tasks', palette.spring, rolePopulation),
    buildTrace('Lack knowledge/tools', palette.mandarin, lackPopulation),
  ];

  return {
    stats: {
      numberOfResponses: responses.length,
    },
    traces,
  };
};

export const SusAFDimensionsComparison = ({
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
      margin: { t: 40, r: 20, b: 60, l: 60 },
      legend: {
        orientation: 'h',
        yanchor: 'bottom',
        y: 1.1,
        xanchor: 'right',
        x: 1,
        traceorder: 'normal',
      },
      xaxis: {
        automargin: true,
      },
      yaxis: {
        title: { text: 'Percentage of Applicable Respondents', standoff: 20 },
        range: [0, 100],
        ticksuffix: '%  ',
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
      graphId="SusAFDimensionsComparison"
      processor={processData}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
      dataExtractor={extractSusAFDimensionsComparisonData}
      comparisonStrategy={comparisonStrategy}
    />
  );
};
