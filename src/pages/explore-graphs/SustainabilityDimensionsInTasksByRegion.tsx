import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor } from '../../components/GraphViews';
import type { SurveyResponse } from '../../data/data-parsing-logic/SurveyResponse';

// --- Constants & Helpers ---
const DIMENSIONS_TEMPLATE = [
  { key: 'roleConsiderEnvironmental', label: 'Environmental' },
  { key: 'roleConsiderSocial', label: 'Social' },
  { key: 'roleConsiderIndividual', label: 'Individual' },
  { key: 'roleConsiderEconomic', label: 'Economic' },
  { key: 'roleConsiderTechnical', label: 'Technical' },
  { key: 'roleConsiderOther', label: 'Other' },
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

// Check if user answered "Yes" to incorporating sustainability (Q28)
// and provided at least one dimension or explicitly said "No" to all (though the latter is rare if Q28 is Yes)
const hasValidDimensionAnswer = (r: SurveyResponse): boolean => {
  const raw = r.raw;
  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // Precondition: Must incorporate sustainability
  if (norm(raw.personIncorporatesSustainability) !== 'yes') return false;

  // Check if any dimension is 'yes'
  if (norm(raw.roleConsiderEnvironmental) === 'yes') return true;
  if (norm(raw.roleConsiderSocial) === 'yes') return true;
  if (norm(raw.roleConsiderIndividual) === 'yes') return true;
  if (norm(raw.roleConsiderEconomic) === 'yes') return true;
  if (norm(raw.roleConsiderTechnical) === 'yes') return true;

  const oVal = norm(raw.roleConsiderOther);
  if (oVal.length > 0 && oVal !== 'n/a') return true;

  // Case where they said Yes to Q28 but didn't check any specific boxes (or checked 'no' for all if that was an option)
  // We consider this valid "Answered" but with 0 counts for dimensions.
  return true;
};

// --- The Processor Logic ---
const processSustainabilityDimensionsInTasksByRegion: ChartProcessor = (responses, palette) => {
  const regionStats = new Map<string, Map<string, number>>();
  const regionEligibleTotals = new Map<string, number>();
  const regionAnsweredTotals = new Map<string, number>();

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // 1. Parse Data
  responses.forEach((r) => {
    const country = r.getCountryOfResidence();
    if (!country || country.toLowerCase() === 'n/a') {
      return;
    }

    const region = getRegion(country);

    // Filter: Only those who incorporate sustainability
    if (norm(r.raw.personIncorporatesSustainability) !== 'yes') {
      return;
    }

    if (!regionStats.has(region)) {
      regionStats.set(region, new Map());
      regionEligibleTotals.set(region, 0);
      regionAnsweredTotals.set(region, 0);
    }

    // Eligible (Denominator - everyone who said "Yes" to Q28 in this region)
    regionEligibleTotals.set(region, (regionEligibleTotals.get(region) ?? 0) + 1);

    // Answered (Numerator) & Dimensions
    if (hasValidDimensionAnswer(r)) {
      regionAnsweredTotals.set(region, (regionAnsweredTotals.get(region) ?? 0) + 1);
      const stats = regionStats.get(region)!;

      DIMENSIONS_TEMPLATE.forEach((dimDef) => {
        let isSelected = false;
        if (dimDef.key === 'roleConsiderOther') {
          const otherValue = norm(r.raw.roleConsiderOther);
          isSelected = otherValue.length > 0 && otherValue !== 'n/a';
        } else {
          isSelected = norm(r.raw[dimDef.key as keyof typeof r.raw]) === 'yes';
        }

        if (isSelected) {
          stats.set(dimDef.label, (stats.get(dimDef.label) ?? 0) + 1);
        }
      });
    }
  });

  // 2. Sort & Filter (Sort by total eligible count)
  const sortedRegions = Array.from(regionEligibleTotals.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([region]) => region);

  const totalEligible = Array.from(regionEligibleTotals.values()).reduce((a, b) => a + b, 0);
  const totalAnswered = Array.from(regionAnsweredTotals.values()).reduce((a, b) => a + b, 0);

  // 3. Define Colors
  const dimColors: Record<string, string> = {
    Environmental: palette.spring,
    Social: palette.mandarin,
    Individual: palette.berry,
    Economic: palette.transport,
    Technical: palette.grey02,
    Other: palette.grey,
  };

  // 4. Build Traces
  const traces: Data[] = DIMENSIONS_TEMPLATE.map((dimDef) => {
    const label = dimDef.label;
    const xValues = sortedRegions.map((region) => regionStats.get(region)?.get(label) ?? 0);

    return {
      type: 'bar',
      name: label,
      orientation: 'h',
      y: sortedRegions,
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
export const SustainabilityDimensionsInTasksByRegion = ({
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
      graphId="SustainabilityDimensionsInTasksByRegion"
      processor={processSustainabilityDimensionsInTasksByRegion}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
    />
  );
};
