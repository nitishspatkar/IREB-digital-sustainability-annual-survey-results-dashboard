import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';

import { useSurveyData } from '../../../data/data-parsing-logic/SurveyContext';
import useThemeColor from '../../../hooks/useThemeColor';
import { SurveyChart } from '../../../components/GraphViews';
import { useGraphDescription } from '../../../hooks/useGraphDescription';
import type { RespondentStat } from '../demographicTypes';

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

const DemographicRegionDistribution = ({
  respondentStats,
  className,
}: DemographicRegionDistributionProps) => {
  // Colors for DACH stack
  const colorDE = useThemeColor('--color-ireb-berry'); // Darkest
  const colorAT = useThemeColor('--color-ireb-light-berry'); // Medium
  const colorCH = useThemeColor('--color-ireb-superlight-berry'); // Lightest

  const colorOther = useThemeColor('--color-ireb-grey-03');
  const tickColor = useThemeColor('--color-ireb-grey-01');
  const whiteText = '#ffffff'; // For inside darker bars
  const darkText = useThemeColor('--color-ireb-grey-01'); // For inside lighter bars

  const surveyResponses = useSurveyData();

  // 1. Data Aggregation
  const { sortedRegions, traceData } = useMemo(() => {
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

    const regions = sorted.map(([r]) => r);

    return {
      sortedRegions: regions,
      traceData: {
        de: sorted.map(([, d]) => d.de),
        at: sorted.map(([, d]) => d.at),
        ch: sorted.map(([, d]) => d.ch),
        other: sorted.map(([, d]) => d.other),
      },
    };
  }, [respondentStats]);

  // 2. Chart Data Configuration
  const chartData = useMemo<Data[]>(() => {
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

    return [
      // Trace 1: Germany (Stacked, Inside)
      {
        ...stackProps,
        name: 'Germany',
        y: sortedRegions,
        x: traceData.de,
        marker: { color: colorDE },
        text: traceData.de.map((v) => (v > 0 ? v.toString() : '')),
        textfont: { family: 'PP Mori, sans-serif', size: 12, color: whiteText },
      },
      // Trace 2: Austria (Stacked, Inside)
      {
        ...stackProps,
        name: 'Austria',
        y: sortedRegions,
        x: traceData.at,
        marker: { color: colorAT },
        text: traceData.at.map((v) => (v > 0 ? v.toString() : '')),
        textfont: { family: 'PP Mori, sans-serif', size: 12, color: whiteText },
      },
      // Trace 3: Switzerland (Stacked, Inside)
      {
        ...stackProps,
        name: 'Switzerland',
        y: sortedRegions,
        x: traceData.ch,
        marker: { color: colorCH },
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
        textfont: { family: 'PP Mori, sans-serif', size: 12, color: tickColor },
      },
    ] as unknown as Data[];
  }, [
    sortedRegions,
    traceData,
    colorDE,
    colorAT,
    colorCH,
    colorOther,
    whiteText,
    darkText,
    tickColor,
  ]);

  // 3. Layout Configuration
  const layout = useMemo<Partial<Layout>>(
    () => ({
      barmode: 'stack', // Enables stacking
      margin: { t: 50, r: 40, b: 40, l: 200 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      showlegend: true,
      legend: {
        orientation: 'h',
        y: 1.1, // Position legend above chart
        x: 0,
        font: { family: 'PP Mori, sans-serif', size: 12, color: tickColor },
      },
      xaxis: {
        tickfont: { family: 'PP Mori, sans-serif', size: 12, color: tickColor },
        title: {
          text: 'Number of Respondents',
          font: { family: 'PP Mori, sans-serif', size: 12, color: tickColor },
        },
      },
      yaxis: {
        tickfont: {
          family: 'PP Mori, sans-serif',
          size: 12,
          color: tickColor,
        },
        automargin: true,
        ticks: 'outside',
        ticklen: 10,
        tickcolor: 'rgba(0,0,0,0)',
      },
    }),
    [tickColor]
  );

  const numberOfResponses = respondentStats.reduce((sum, stat) => sum + stat.count, 0);
  const totalResponses = surveyResponses.length;
  const responseRate = totalResponses > 0 ? (numberOfResponses / totalResponses) * 100 : 0;

  const { question, description } = useGraphDescription('DemographicByRegion');

  return (
    <SurveyChart
      className={className}
      question={question || 'Regional Distribution'}
      description={description || 'Respondents mainly come from the DACH region.'}
      numberOfResponses={numberOfResponses}
      responseRate={responseRate}
      data={chartData}
      layout={layout}
      hasExploreData={false}
      onExplore={() => {}}
    />
  );
};

export default DemographicRegionDistribution;
