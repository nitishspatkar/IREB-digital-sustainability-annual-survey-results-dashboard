import { useMemo, useCallback } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor, type DataExtractor } from '../../components/GraphViews';
import { createDumbbellComparisonStrategy } from '../../components/comparision-components/DumbbellComparisonStrategy';
import type { HorizontalBarData } from '../../components/comparision-components/HorizontalBarComparisonStrategy';

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
    if (!country || country.toLowerCase() === 'n/a') {
      return;
    }

    const region = getRegion(country);
    const participatedInTraining = norm(r.raw.participatedInTraining);

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

  const participationColors: Record<string, string> = {
    Participated: palette.spring,
    'Did Not Participate': palette.mandarin,
  };

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

const comparisonStrategy = createDumbbellComparisonStrategy({
  normalizeToPercentage: false,
  formatAsPercentage: true,
});

// --- The Component ---
export const TrainingParticipationByRegion = ({
  onBack,
  showBackButton = true,
}: {
  onBack: () => void;
  showBackButton?: boolean;
}) => {
  // --- DATA EXTRACTOR ---
  const dataExtractor = useCallback<DataExtractor<HorizontalBarData>>((responses) => {
    const regionParticipationCounts = new Map<string, { yes: number; no: number }>();
    let totalValidResponses = 0;

    responses.forEach((r) => {
      const country = r.getCountryOfResidence();
      if (!country || country.toLowerCase() === 'n/a') return;

      const region = getRegion(country);
      const participated = r.raw.participatedInTraining?.trim().toLowerCase();

      if (participated === 'yes' || participated === 'no') {
        totalValidResponses++;
        if (!regionParticipationCounts.has(region)) {
          regionParticipationCounts.set(region, { yes: 0, no: 0 });
        }
        const counts = regionParticipationCounts.get(region)!;
        if (participated === 'yes') {
          counts.yes++;
        } else {
          counts.no++;
        }
      }
    });

    const items: { label: string; value: number }[] = [];

    regionParticipationCounts.forEach((counts, region) => {
      // Calculate percentages based on TOTAL valid responses (Grand Total)
      const yesPct = totalValidResponses > 0 ? (counts.yes / totalValidResponses) * 100 : 0;
      const noPct = totalValidResponses > 0 ? (counts.no / totalValidResponses) * 100 : 0;

      if (yesPct > 0) {
        items.push({ label: `${region} - Participated`, value: yesPct });
      }
      if (noPct > 0) {
        items.push({ label: `${region} - Did Not Participate`, value: noPct });
      }
    });

    return {
      items,
      stats: { numberOfResponses: totalValidResponses },
    };
  }, []);

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
      dataExtractor={dataExtractor}
      comparisonStrategy={comparisonStrategy}
    />
  );
};
