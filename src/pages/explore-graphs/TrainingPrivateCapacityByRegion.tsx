import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor } from '../../components/GraphViews';

// --- Constants & Helpers ---
const CAPACITY_TEMPLATE = [
  { key: 'yes', label: 'Yes' },
  { key: 'no', label: 'No' },
  { key: 'mixed', label: 'Mixed' },
];

const capacityOptions = [
  { label: 'Yes', searchTerms: ['yes'] },
  { label: 'No', searchTerms: ['no'] },
  {
    label: 'Mixed',
    searchTerms: ['my organization paid it on some occasions, and i paid it myself on others.'],
  },
];

// Helper to map countries to specific regions
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

// --- The Processor Logic ---
const processTrainingPrivateCapacityByRegion: ChartProcessor = (responses, palette) => {
  const regionCapacityStats = new Map<string, Map<string, number>>();
  const regionTotals = new Map<string, number>(); // Answered totals
  const regionEligibleTotals = new Map<string, number>(); // Eligible totals (participated in training)

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // 1. Parse Data
  responses.forEach((r) => {
    // Filter: Only those who participated in training
    if (norm(r.raw.participatedInTraining) !== 'yes') {
      return;
    }

    const country = r.getCountryOfResidence();
    if (!country || country.toLowerCase() === 'n/a') {
      return;
    }

    const region = getRegion(country);

    if (!regionCapacityStats.has(region)) {
      regionCapacityStats.set(region, new Map());
      regionTotals.set(region, 0);
      regionEligibleTotals.set(region, 0);
    }

    // Count eligible (Denominator) - Valid region and participated in training
    regionEligibleTotals.set(region, (regionEligibleTotals.get(region) ?? 0) + 1);

    const rawCapacity = norm(r.raw.trainingPrivateCapacity ?? '');

    // Determine capacity category
    const matchedOption = capacityOptions.find((opt) =>
      opt.searchTerms.some((term) => rawCapacity.startsWith(term))
    );

    if (!matchedOption) return;

    // Count total responses per region (Numerator) - Valid answer provided
    regionTotals.set(region, (regionTotals.get(region) ?? 0) + 1);

    const capacityMap = regionCapacityStats.get(region)!;
    capacityMap.set(matchedOption.label, (capacityMap.get(matchedOption.label) ?? 0) + 1);
  });

  // 2. Sort & Filter
  const sortedRegions = Array.from(regionEligibleTotals.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([region]) => region);

  const totalRespondents = Array.from(regionTotals.values()).reduce((a, b) => a + b, 0);
  const totalEligible = Array.from(regionEligibleTotals.values()).reduce((a, b) => a + b, 0);

  // 3. Define Colors for Capacity
  const capacityColors: Record<string, string> = {
    Yes: palette.spring,
    No: palette.mandarin,
    Mixed: palette.grey02,
  };

  // 4. Build Traces (One per Capacity type)
  const traces: Data[] = CAPACITY_TEMPLATE.map((capacityDef) => {
    const capacityLabel = capacityDef.label;
    const xValues = sortedRegions.map(
      (region) => regionCapacityStats.get(region)?.get(capacityLabel) ?? 0
    );

    return {
      type: 'bar',
      name: capacityLabel,
      orientation: 'h',
      y: sortedRegions,
      x: xValues,
      marker: {
        color: capacityColors[capacityLabel],
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
      numberOfResponses: totalRespondents,
      totalEligible: totalEligible,
    },
    traces: traces,
  };
};

// --- The Component ---
export const TrainingPrivateCapacityByRegion = ({
  onBack,
  showBackButton = true,
}: {
  onBack: () => void;
  showBackButton?: boolean;
}) => {
  // Static layout overrides
  const layout = useMemo<Partial<Layout>>(
    () => ({
      barmode: 'stack', // Stacked bars
      bargap: 0.15, // Thicker bars
      margin: { t: 40, r: 20, b: 60, l: 150 }, // Left margin for Regions
      uniformtext: {
        mode: 'show',
        minsize: 10,
      },
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
        y: 1.1, // Position legend above chart
        xanchor: 'right',
        x: 1,
        traceorder: 'normal',
      },
    }),
    []
  );

  return (
    <GenericChart
      graphId="TrainingPrivateCapacityByRegion"
      processor={processTrainingPrivateCapacityByRegion}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
    />
  );
};
