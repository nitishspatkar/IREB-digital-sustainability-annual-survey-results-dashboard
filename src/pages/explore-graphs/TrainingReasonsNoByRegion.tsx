import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor } from '../../components/GraphViews';

// --- Constants & Helpers ---
const TRAINING_REASONS_TEMPLATE = [
  { key: 'trainingNotAware', label: 'I was not aware such programs existed' },
  { key: 'trainingNoOrganizationOffer', label: 'My organization does not offer such programs' },
  { key: 'trainingNoOpportunity', label: 'I have not had the opportunity to attend' },
  { key: 'trainingNoNeed', label: "I don't see the need for such training" },
  { key: 'trainingTooExpensive', label: 'The cost is too high' },
  { key: 'trainingOtherReason', label: 'Other' },
];

// Helper to map countries to specific regions (copied from other region components)
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
const processTrainingReasonsNoByRegion: ChartProcessor = (responses, palette) => {
  const regionReasonsStats = new Map<string, Map<string, number>>();
  const regionTotals = new Map<string, number>();

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // 1. Parse Data
  responses.forEach((r) => {
    const country = r.getCountryOfResidence();
    // We only care if country is present, getRegion handles the rest.
    if (!country || country.toLowerCase() === 'n/a') {
      return;
    }

    const region = getRegion(country);
    const participatedInTraining = norm(r.raw.participatedInTraining);

    if (participatedInTraining !== 'no') {
      return;
    }

    if (!regionReasonsStats.has(region)) {
      regionReasonsStats.set(region, new Map());
      regionTotals.set(region, 0);
    }
    regionTotals.set(region, (regionTotals.get(region) ?? 0) + 1);

    const reasons = regionReasonsStats.get(region)!;

    TRAINING_REASONS_TEMPLATE.forEach((reasonDef) => {
      let isReasonSelected = false;
      if (reasonDef.key === 'trainingOtherReason') {
        const otherValue = norm(r.raw.trainingOtherReason);
        isReasonSelected = otherValue.length > 0 && otherValue !== 'n/a';
      } else {
        isReasonSelected = norm(r.raw[reasonDef.key as keyof typeof r.raw]) === 'yes';
      }

      if (isReasonSelected) {
        reasons.set(reasonDef.label, (reasons.get(reasonDef.label) ?? 0) + 1);
      }
    });
  });

  // 2. Sort & Filter
  const sortedRegions = Array.from(regionTotals.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([region]) => region);

  const totalRespondents = Array.from(regionTotals.values()).reduce((a, b) => a + b, 0);

  // 3. Define Colors for Reasons
  const reasonColors: Record<string, string> = {
    'I was not aware such programs existed': palette.berry,
    'My organization does not offer such programs': palette.spring,
    'I have not had the opportunity to attend': palette.mandarin,
    "I don't see the need for such training": palette.darkSpring,
    'The cost is too high': palette.lightBerry,
    Other: palette.grey,
  };

  // 4. Build Traces (One per Reason)
  const traces: Data[] = TRAINING_REASONS_TEMPLATE.map((reasonDef) => {
    const reasonLabel = reasonDef.label;
    const xValues = sortedRegions.map(
      (region) => regionReasonsStats.get(region)?.get(reasonLabel) ?? 0
    );

    return {
      type: 'bar',
      name: reasonLabel,
      orientation: 'h',
      y: sortedRegions,
      x: xValues,
      marker: {
        color: reasonColors[reasonLabel],
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
export const TrainingReasonsNoByRegion = ({
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
        mode: 'show', // Versteckt Zahlen, die nicht passen, statt sie zu verkleinern
        minsize: 10, // Muss identisch mit Ihrer textfont.size sein
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
      },
    }),
    []
  );

  return (
    <GenericChart
      graphId="TrainingReasonsNoByRegion"
      processor={processTrainingReasonsNoByRegion}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
    />
  );
};
