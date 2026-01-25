import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';

import { GenericChart, type ChartProcessor, type DataExtractor } from '../../components/GraphViews';
import { createDumbbellComparisonStrategy } from '../../components/comparision-components/DumbbellComparisonStrategy';
import type { HorizontalBarData } from '../../components/comparision-components/HorizontalBarComparisonStrategy';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

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

const extractPersonIncorporatesSustainabilityByAgeData: DataExtractor<HorizontalBarData> = (
  responses
) => {
  const dataMap = new Map<string, { yes: number; no: number; total: number }>();

  responses.forEach((r) => {
    const ageGroup = normalize(r.raw.ageGroup ?? '');
    const incorporates = normalize(r.raw.personIncorporatesSustainability ?? '').toLowerCase();

    if (!ageGroup || ageGroup.toLowerCase() === 'n/a') return;
    if (incorporates !== 'yes' && incorporates !== 'no') return;

    if (!dataMap.has(ageGroup)) {
      dataMap.set(ageGroup, { yes: 0, no: 0, total: 0 });
    }

    const entry = dataMap.get(ageGroup)!;
    entry.total++;

    if (incorporates === 'yes') {
      entry.yes++;
    } else if (incorporates === 'no') {
      entry.no++;
    }
  });

  const sortedAgeGroups = Array.from(dataMap.entries()).sort((a, b) => {
    const aMatch = a[0].match(/^(\d+)/);
    const bMatch = b[0].match(/^(\d+)/);

    if (aMatch && bMatch) {
      return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
    }

    return a[0].localeCompare(b[0]);
  });

  const items: { label: string; value: number }[] = [];
  const globalTotal = sortedAgeGroups.reduce((acc, [, stats]) => acc + stats.total, 0);

  sortedAgeGroups.forEach(([ageGroup, stats]) => {
    const yesPct = globalTotal > 0 ? (stats.yes / globalTotal) * 100 : 0;
    const noPct = globalTotal > 0 ? (stats.no / globalTotal) * 100 : 0;

    items.push({
      label: `${ageGroup}<br>Yes`,
      value: yesPct,
    });
    items.push({
      label: `${ageGroup}<br>No`,
      value: noPct,
    });
  });

  return {
    items,
    stats: {
      numberOfResponses: globalTotal,
    },
  };
};

// --- Component ---

export const PersonIncorporatesSustainabilityByAge = ({
  onBack,
  showBackButton = true,
}: {
  onBack?: () => void;
  showBackButton?: boolean;
}) => {
  const processor: ChartProcessor = useMemo(
    () => (responses, palette) => {
      const dataMap = new Map<string, { yes: number; no: number; total: number }>();

      responses.forEach((r) => {
        const ageGroup = normalize(r.raw.ageGroup ?? '');
        const incorporates = normalize(r.raw.personIncorporatesSustainability ?? '').toLowerCase();

        if (!ageGroup || ageGroup.toLowerCase() === 'n/a') return;
        if (incorporates !== 'yes' && incorporates !== 'no') return;

        if (!dataMap.has(ageGroup)) {
          dataMap.set(ageGroup, { yes: 0, no: 0, total: 0 });
        }

        const entry = dataMap.get(ageGroup)!;
        entry.total++;

        if (incorporates === 'yes') {
          entry.yes++;
        } else if (incorporates === 'no') {
          entry.no++;
        }
      });

      // Sort age groups by extracting leading number
      const sortedAgeGroups = Array.from(dataMap.entries()).sort((a, b) => {
        const aMatch = a[0].match(/^(\d+)/);
        const bMatch = b[0].match(/^(\d+)/);

        if (aMatch && bMatch) {
          return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
        }

        return a[0].localeCompare(b[0]);
      });

      const categories = sortedAgeGroups.map(([age]) => age);
      const yesValues = sortedAgeGroups.map(([, stats]) => stats.yes);
      const noValues = sortedAgeGroups.map(([, stats]) => stats.no);
      const validResponses = sortedAgeGroups.reduce((acc, [, stats]) => acc + stats.total, 0);

      const traces: Data[] = [
        {
          x: categories, // Categories on X for Vertical
          y: yesValues, // Values on Y for Vertical
          name: 'Yes',
          type: 'bar',
          marker: {
            color: palette.spring,
          },
          text: yesValues.map((v) => (v > 0 ? v.toString() : '')),
          textposition: 'inside',
          insidetextanchor: 'middle',
          textfont: {
            family: 'PP Mori, sans-serif',
            size: 13,
            color: '#FFFFFF',
          },
          hoverinfo: 'name' as const,
        },
        {
          x: categories, // Categories on X for Vertical
          y: noValues, // Values on Y for Vertical
          name: 'No',
          type: 'bar',
          marker: {
            color: palette.mandarin,
          },
          text: noValues.map((v) => (v > 0 ? v.toString() : '')),
          textposition: 'inside',
          insidetextanchor: 'middle',
          textfont: {
            family: 'PP Mori, sans-serif',
            size: 12,
            color: '#FFFFFF',
          },
          hoverinfo: 'name' as const,
        },
      ];

      return {
        traces,
        stats: {
          numberOfResponses: validResponses,
        },
      };
    },
    []
  );

  const layout = useMemo<Partial<Layout>>(
    () => ({
      barmode: 'group', // Changed from 'stack' to 'group' for side-by-side
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
        ticks: 'outside',
        ticklen: 10,
        tickcolor: 'rgba(0,0,0,0)',
      },
      yaxis: {
        title: {
          text: 'Number of Respondents',
        },
      },
    }),
    []
  );

  return (
    <GenericChart
      graphId="PersonIncorporatesSustainabilityByAge"
      processor={processor}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
      dataExtractor={extractPersonIncorporatesSustainabilityByAgeData}
      comparisonStrategy={comparisonStrategy}
    />
  );
};
