import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor } from '../../components/GraphViews';

// --- Constants & Helpers ---
const TRAINING_PARTICIPATION_TEMPLATE = [
  { key: 'yes', label: 'Participated' },
  { key: 'no', label: 'Did Not Participate' },
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

// --- The Processor Logic ---
const processTrainingParticipationByRegion: ChartProcessor = (responses, palette) => {
  const regionParticipationStats = new Map<string, Map<string, number>>();
  const regionTotals = new Map<string, number>();

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // 1. Parse Data
  responses.forEach((r) => {
    const country = r.getCountryOfResidence();
    // We only care if country is present, getRegion handles the rest.
    // However, if country is missing/NA, getRegion returns 'Other' or we might want to skip?
    // Usually 'Other' is fine, or we check if country is defined.
    if (!country || country.toLowerCase() === 'n/a') {
      return;
    }

    const region = getRegion(country);
    const participatedInTraining = norm(r.raw.participatedInTraining);

    // Filter out responses that don't have a valid Yes/No answer for training
    if (participatedInTraining !== 'yes' && participatedInTraining !== 'no') {
      return;
    }

    if (!regionParticipationStats.has(region)) {
      regionParticipationStats.set(region, new Map());
      regionTotals.set(region, 0);
    }
    regionTotals.set(region, (regionTotals.get(region) ?? 0) + 1);

    const participationMap = regionParticipationStats.get(region)!;

    if (participatedInTraining === 'yes') {
      participationMap.set('Participated', (participationMap.get('Participated') ?? 0) + 1);
    } else if (participatedInTraining === 'no') {
      participationMap.set(
        'Did Not Participate',
        (participationMap.get('Did Not Participate') ?? 0) + 1
      );
    }
  });

  // 2. Sort & Filter
  const sortedRegions = Array.from(regionTotals.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([region]) => region);

  const totalRespondents = Array.from(regionTotals.values()).reduce((a, b) => a + b, 0);

  // 3. Define Colors for Participation (Matching TrainingParticipation.tsx parent)
  const participationColors: Record<string, string> = {
    Participated: palette.spring,
    'Did Not Participate': palette.mandarin,
  };

  // 4. Build Traces (One per Participation type)
  const traces: Data[] = TRAINING_PARTICIPATION_TEMPLATE.map((participationDef) => {
    const participationLabel = participationDef.label;
    const xValues = sortedRegions.map(
      (region) => regionParticipationStats.get(region)?.get(participationLabel) ?? 0
    );

    return {
      type: 'bar',
      name: participationLabel,
      orientation: 'h',
      y: sortedRegions,
      x: xValues,
      marker: {
        color: participationColors[participationLabel],
      },
      text: xValues.map((v) => (v > 0 ? v.toString() : '')),
      textposition: 'inside',
      insidetextanchor: 'middle',
      textfont: {
        family: 'PP Mori, sans-serif',
        size: 13,
        color: '#FFFFFF', // White text for contrast inside bars
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
export const TrainingParticipationByRegion = ({
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
      margin: { t: 40, r: 20, b: 60, l: 150 }, // Left margin for Region names
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
      graphId="TrainingParticipationByRegion"
      processor={processTrainingParticipationByRegion}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
    />
  );
};
