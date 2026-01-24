import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor, type DataExtractor } from '../../components/GraphViews';
import { createDumbbellComparisonStrategy } from '../../components/comparision-components/DumbbellComparisonStrategy';
import type { HorizontalBarData } from '../../components/comparision-components/HorizontalBarComparisonStrategy';

// --- Constants & Helpers ---
const PRACTICES_TEMPLATE = [
  { key: 'yes', label: 'Yes' },
  { key: 'no', label: 'No' },
  { key: 'not sure', label: 'Not sure' },
];

// Helper to map countries to specific regions (copied from DemographicRegionDistribution)
const getRegion = (country: string): string => {
  const c = country?.trim().toLowerCase() ?? '';

  if (['germany', 'austria', 'switzerland', 'deutschland', 'österreich', 'schweiz'].includes(c))
    return 'DACH';

  const europe = [
    'united kingdom',
    'uk',
    'france',
    'italy',
    'spain',
    'netherlands',
    'belgium',
    'poland',
    'sweden',
    'norway',
    'denmark',
    'finland',
    'portugal',
    'greece',
    'ireland',
    'czech republic',
    'hungary',
    'romania',
    'bulgaria',
    'croatia',
    'slovakia',
    'slovenia',
    'estonia',
    'latvia',
    'lithuania',
    'luxembourg',
    'malta',
    'cyprus',
    'iceland',
  ];
  if (europe.includes(c)) return 'Rest of Europe';

  if (['usa', 'united states', 'canada', 'mexico'].includes(c)) return 'North America';

  if (
    [
      'china',
      'india',
      'japan',
      'south korea',
      'singapore',
      'vietnam',
      'thailand',
      'indonesia',
      'philippines',
      'malaysia',
    ].includes(c)
  )
    return 'Asia';

  if (['brazil', 'argentina', 'colombia', 'chile', 'peru'].includes(c)) return 'South America';

  if (['south africa', 'nigeria', 'egypt', 'kenya', 'morocco'].includes(c)) return 'Africa';

  if (['australia', 'new zealand'].includes(c)) return 'Oceania';

  return 'Other';
};

const extractOrganizationIncorporatesPracticesByRegionData: DataExtractor<HorizontalBarData> = (
  responses
) => {
  const regionCounts = new Map<string, { yes: number; no: number; notSure: number }>();
  let totalValidResponses = 0;
  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  responses.forEach((r) => {
    const country = r.getCountryOfResidence();
    if (!country || country.toLowerCase() === 'n/a') {
      return;
    }
    const region = getRegion(country);
    const hasPractices = norm(r.raw.organizationIncorporatesSustainablePractices ?? '');

    if (hasPractices !== 'yes' && hasPractices !== 'no' && hasPractices !== 'not sure') {
      return;
    }

    totalValidResponses++;

    if (!regionCounts.has(region)) {
      regionCounts.set(region, { yes: 0, no: 0, notSure: 0 });
    }

    const counts = regionCounts.get(region)!;
    if (hasPractices === 'yes') counts.yes++;
    else if (hasPractices === 'no') counts.no++;
    else counts.notSure++;
  });

  const items: { label: string; value: number }[] = [];

  const sortedRegions = Array.from(regionCounts.keys()).sort();

  sortedRegions.forEach((region) => {
    const counts = regionCounts.get(region)!;
    if (totalValidResponses > 0) {
      const yesPct = (counts.yes / totalValidResponses) * 100;
      const noPct = (counts.no / totalValidResponses) * 100;
      const notSurePct = (counts.notSure / totalValidResponses) * 100;

      if (yesPct > 0) items.push({ label: `${region}<br>Yes`, value: yesPct });
      if (noPct > 0) items.push({ label: `${region}<br>No`, value: noPct });
      if (notSurePct > 0) items.push({ label: `${region}<br>Not sure`, value: notSurePct });
    }
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
const processOrganizationIncorporatesPracticesByRegion: ChartProcessor = (responses, palette) => {
  const regionStats = new Map<string, Map<string, number>>();
  const regionTotals = new Map<string, number>();

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // 1. Parse Data
  responses.forEach((r) => {
    const country = r.getCountryOfResidence();
    if (!country || country.toLowerCase() === 'n/a') {
      return;
    }
    const region = getRegion(country);

    const hasPractices = norm(r.raw.organizationIncorporatesSustainablePractices ?? '');

    // Filter valid answers
    if (hasPractices !== 'yes' && hasPractices !== 'no' && hasPractices !== 'not sure') {
      return;
    }

    if (!regionStats.has(region)) {
      regionStats.set(region, new Map());
      regionTotals.set(region, 0);
    }

    regionTotals.set(region, (regionTotals.get(region) ?? 0) + 1);

    const statMap = regionStats.get(region)!;

    let label = '';
    if (hasPractices === 'yes') label = 'Yes';
    else if (hasPractices === 'no') label = 'No';
    else label = 'Not sure';

    statMap.set(label, (statMap.get(label) ?? 0) + 1);
  });

  // 2. Sort & Filter (Sort by total count)
  const sortedRegions = Array.from(regionTotals.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([region]) => region);

  const totalRespondents = Array.from(regionTotals.values()).reduce((a, b) => a + b, 0);

  // 3. Define Colors
  const colors: Record<string, string> = {
    Yes: palette.spring,
    No: palette.mandarin,
    'Not sure': palette.grey02,
  };

  // 4. Build Traces
  const traces: Data[] = PRACTICES_TEMPLATE.map((def) => {
    const label = def.label;
    const xValues = sortedRegions.map((region) => regionStats.get(region)?.get(label) ?? 0);

    return {
      type: 'bar',
      name: label,
      orientation: 'h',
      y: sortedRegions,
      x: xValues,
      marker: {
        color: colors[label],
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
    stats: { numberOfResponses: totalRespondents },
    traces: traces,
  };
};

// --- The Component ---
export const OrganizationIncorporatesPracticesByRegion = ({
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
      margin: { t: 40, r: 20, b: 60, l: 200 }, // Left margin for Region names
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
      graphId="OrganizationIncorporatesPracticesByRegion"
      processor={processOrganizationIncorporatesPracticesByRegion}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
      dataExtractor={extractOrganizationIncorporatesPracticesByRegionData}
      comparisonStrategy={comparisonStrategy}
    />
  );
};
