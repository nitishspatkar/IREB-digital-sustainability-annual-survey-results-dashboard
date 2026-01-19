import { useMemo, useCallback } from 'react';
import type { Data, Layout } from 'plotly.js';

import useThemeColor from '../../../hooks/useThemeColor';
import {
  GenericChart,
  type ChartProcessor,
  type DataExtractor,
} from '../../../components/GraphViews';
import type { RespondentStat } from '../demographicTypes';
import { createDumbbellComparisonStrategy } from '../../../components/comparision-components/DumbbellComparisonStrategy';
import { TrainingParticipationByRegion } from '../../explore-graphs/TrainingParticipationByRegion';
import { TrainingPrivateCapacityByRegion } from '../../explore-graphs/TrainingPrivateCapacityByRegion';
import { TrainingProgramsCountByRegion } from '../../explore-graphs/TrainingProgramsCountByRegion';
import { TrainingReasonsNoByRegion } from '../../explore-graphs/TrainingReasonsNoByRegion';
import { TrainingSatisfactionByRegion } from '../../explore-graphs/TrainingSatisfactionByRegion';
import { SustainabilityDimensionsInTasksByRegion } from '../../explore-graphs/SustainabilityDimensionsInTasksByRegion.tsx';
import { OrganizationIncorporatesPracticesByRegion } from '../../explore-graphs/OrganizationIncorporatesPracticesByRegion.tsx';
import type { HorizontalBarData } from '../../../components/comparision-components/HorizontalBarComparisonStrategy.ts';

type DemographicRegionDistributionProps = {
  respondentStats: RespondentStat[];
  className?: string;
};

// Helper to map countries to specific regions
const getRegion = (country: string): string => {
  const c = country.trim().toLowerCase();

  // Specific DACH mapping happens in the data logic,
  // here we just identify the broader buckets for sorting/grouping
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

// Helper to identify specific DACH country
const getDachCountry = (country: string): 'Germany' | 'Austria' | 'Switzerland' | null => {
  const c = country.trim().toLowerCase();
  if (['germany', 'deutschland'].includes(c)) return 'Germany';
  if (['austria', 'österreich'].includes(c)) return 'Austria';
  if (['switzerland', 'schweiz'].includes(c)) return 'Switzerland';
  return null;
};

const comparisonStrategy = createDumbbellComparisonStrategy({});

const DemographicRegionDistribution = ({ respondentStats }: DemographicRegionDistributionProps) => {
  const colorOther = useThemeColor('--color-ireb-grey-03');
  const tickColor = useThemeColor('--color-ireb-grey-01');
  const whiteText = '#ffffff'; // For inside darker bars
  const darkText = useThemeColor('--color-ireb-grey-01'); // For inside lighter bars

  // --- DATA EXTRACTOR ---
  const dataExtractor = useCallback<DataExtractor<HorizontalBarData>>((responses) => {
    // Aggregate by region, showing total for each region
    const regionMap = new Map<string, number>();
    let validCount = 0;

    responses.forEach((r) => {
      const rawCountry = r.getCountryOfResidence();
      const country = rawCountry.replace(/\s+/g, ' ').trim();

      if (country && country.toLowerCase() !== 'n/a') {
        const region = getRegion(country);
        regionMap.set(region, (regionMap.get(region) ?? 0) + 1);
        validCount++;
      }
    });

    const items = Array.from(regionMap.entries())
      .filter(([, count]) => count > 0)
      .map(([label, value]) => ({ label, value }));

    return {
      items,
      stats: {
        numberOfResponses: validCount,
      },
    };
  }, []);

  const processor = useCallback<ChartProcessor>(
    (responses, palette) => {
      // 1. Data Aggregation
      // Structure: Map<RegionName, { total: number, de: number, at: number, ch: number, other: number }>
      const regionMap = new Map<
        string,
        { total: number; de: number; at: number; ch: number; other: number }
      >();

      // Initialize map with 0
      const ensureRegion = (r: string) => {
        if (!regionMap.has(r)) regionMap.set(r, { total: 0, de: 0, at: 0, ch: 0, other: 0 });
      };

      respondentStats.forEach((stat) => {
        const region = getRegion(stat.country);
        ensureRegion(region);
        const entry = regionMap.get(region)!;

        entry.total += stat.count;

        if (region === 'DACH') {
          const dachCountry = getDachCountry(stat.country);
          if (dachCountry === 'Germany') entry.de += stat.count;
          else if (dachCountry === 'Austria') entry.at += stat.count;
          else if (dachCountry === 'Switzerland') entry.ch += stat.count;
        } else {
          entry.other += stat.count;
        }
      });

      // Sort regions by total count (ascending for Plotly horizontal bar)
      const sorted = Array.from(regionMap.entries())
        .filter(([, data]) => data.total > 0)
        .sort((a, b) => a[1].total - b[1].total);

      const sortedRegions = sorted.map(([r]) => r);
      const traceData = {
        de: sorted.map(([, d]) => d.de),
        at: sorted.map(([, d]) => d.at),
        ch: sorted.map(([, d]) => d.ch),
        other: sorted.map(([, d]) => d.other),
      };

      // 2. Chart Data Configuration
      // Base props for stacked segments (DACH)
      const stackProps = {
        type: 'bar' as const,
        orientation: 'h' as const,
        hoverinfo: 'name+x' as const,
        textposition: 'inside' as const, // <--- Zwingend innen für DACH
        insidetextanchor: 'middle' as const,
      };

      // Base props for single bars (Others)
      const singleProps = {
        type: 'bar' as const,
        orientation: 'h' as const,
        hoverinfo: 'name+x' as const,
        textposition: 'outside' as const, // <--- Außen für den Rest (lesbarer)
      };

      const traces = [
        // Trace 1: Germany (Stacked, Inside)
        {
          ...stackProps,
          name: 'Germany',
          y: sortedRegions,
          x: traceData.de,
          marker: { color: palette.berry },
          text: traceData.de.map((v) => (v > 0 ? v.toString() : '')),
          textfont: { family: 'PP Mori, sans-serif', size: 12, color: whiteText },
        },
        // Trace 2: Austria (Stacked, Inside)
        {
          ...stackProps,
          name: 'Austria',
          y: sortedRegions,
          x: traceData.at,
          marker: { color: palette.lightBerry },
          text: traceData.at.map((v) => (v > 0 ? v.toString() : '')),
          textfont: { family: 'PP Mori, sans-serif', size: 12, color: whiteText },
        },
        // Trace 3: Switzerland (Stacked, Inside)
        {
          ...stackProps,
          name: 'Switzerland',
          y: sortedRegions,
          x: traceData.ch,
          marker: { color: palette.superLightBerry },
          text: traceData.ch.map((v) => (v > 0 ? v.toString() : '')),
          textfont: { family: 'PP Mori, sans-serif', size: 12, color: darkText },
        },
        // Trace 4: Other Regions (Single, Outside)
        {
          ...singleProps,
          name: 'Region Total',
          y: sortedRegions,
          x: traceData.other,
          marker: { color: colorOther },
          text: traceData.other.map((v) => (v > 0 ? v.toString() : '')),
          textfont: { family: 'PP Mori, sans-serif', size: 12, color: palette.grey },
        },
      ] as unknown as Data[];

      const numberOfResponses = respondentStats.reduce((sum, stat) => sum + stat.count, 0);

      return {
        traces,
        stats: {
          numberOfResponses,
          totalEligible: responses.length,
        },
      };
    },
    [respondentStats, colorOther, darkText, whiteText]
  );

  // 3. Layout Configuration
  const layout = useMemo<Partial<Layout>>(
    () => ({
      barmode: 'stack', // Enables stacking
      margin: { t: 50, r: 40, b: 40, l: 200 },
      showlegend: true,
      legend: {
        orientation: 'h',
        yanchor: 'bottom',
        y: 1.1,
        xanchor: 'right',
        x: 1,
        font: { family: 'PP Mori, sans-serif', size: 12, color: tickColor },
      },
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
    [tickColor]
  );

  return (
    <GenericChart
      graphId="DemographicByRegion"
      processor={processor}
      layout={layout}
      dataExtractor={dataExtractor}
      comparisonStrategy={comparisonStrategy}
      exploreComponents={[
        TrainingParticipationByRegion,
        TrainingPrivateCapacityByRegion,
        TrainingProgramsCountByRegion,
        TrainingReasonsNoByRegion,
        TrainingSatisfactionByRegion,
        SustainabilityDimensionsInTasksByRegion,
        OrganizationIncorporatesPracticesByRegion,
      ]}
    />
  );
};

export default DemographicRegionDistribution;
