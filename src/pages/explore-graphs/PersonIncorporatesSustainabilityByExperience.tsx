import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';

import { GenericChart, type ChartProcessor, type DataExtractor } from '../../components/GraphViews';
import { createDumbbellComparisonStrategy } from '../../components/comparision-components/DumbbellComparisonStrategy';
import type { HorizontalBarData } from '../../components/comparision-components/HorizontalBarComparisonStrategy';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

// --- Sorting Helper ---
const sortExperience = (aLabel: string, bLabel: string) => {
  const aMatch = aLabel.match(/^(\d+)/);
  const bMatch = bLabel.match(/^(\d+)/);

  if (aLabel.startsWith('Less than')) return -1;
  if (bLabel.startsWith('Less than')) return 1;
  if (aLabel.startsWith('More than')) return 1;
  if (bLabel.startsWith('More than')) return -1;
  if (aMatch && bMatch) return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
  return aLabel.localeCompare(bLabel);
};

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

const extractPersonIncorporatesSustainabilityByExperienceData: DataExtractor<HorizontalBarData> = (
  responses
) => {
  const dataMap = new Map<string, { yes: number; no: number; total: number }>();

  responses.forEach((r) => {
    const experience = normalize(r.raw.professionalExperienceYears ?? '');
    const incorporates = normalize(r.raw.personIncorporatesSustainability ?? '').toLowerCase();

    if (!experience || experience.toLowerCase() === 'n/a') return;
    if (incorporates !== 'yes' && incorporates !== 'no') return;

    if (!dataMap.has(experience)) {
      dataMap.set(experience, { yes: 0, no: 0, total: 0 });
    }

    const entry = dataMap.get(experience)!;
    entry.total++;

    if (incorporates === 'yes') {
      entry.yes++;
    } else if (incorporates === 'no') {
      entry.no++;
    }
  });

  const sortedExperience = Array.from(dataMap.entries()).sort((a, b) => sortExperience(a[0], b[0]));

  const items: { label: string; value: number }[] = [];
  const globalTotal = sortedExperience.reduce((acc, [, stats]) => acc + stats.total, 0);

  sortedExperience.forEach(([experience, stats]) => {
    const yesPct = globalTotal > 0 ? (stats.yes / globalTotal) * 100 : 0;
    const noPct = globalTotal > 0 ? (stats.no / globalTotal) * 100 : 0;

    items.push({
      label: `${experience}<br>Yes`,
      value: yesPct,
    });
    items.push({
      label: `${experience}<br>No`,
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

export const PersonIncorporatesSustainabilityByExperience = ({
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
        const experience = normalize(r.raw.professionalExperienceYears ?? '');
        const incorporates = normalize(r.raw.personIncorporatesSustainability ?? '').toLowerCase();

        if (!experience || experience.toLowerCase() === 'n/a') return;
        if (incorporates !== 'yes' && incorporates !== 'no') return;

        if (!dataMap.has(experience)) {
          dataMap.set(experience, { yes: 0, no: 0, total: 0 });
        }

        const entry = dataMap.get(experience)!;
        entry.total++;

        if (incorporates === 'yes') {
          entry.yes++;
        } else if (incorporates === 'no') {
          entry.no++;
        }
      });

      // Sort experience groups using the helper
      const sortedExperience = Array.from(dataMap.entries()).sort((a, b) =>
        sortExperience(a[0], b[0])
      );

      const categories = sortedExperience.map(([exp]) => exp);
      const yesValues = sortedExperience.map(([, stats]) => stats.yes);
      const noValues = sortedExperience.map(([, stats]) => stats.no);
      const validResponses = sortedExperience.reduce((acc, [, stats]) => acc + stats.total, 0);

      const traces: Data[] = [
        {
          x: categories,
          y: yesValues,
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
          x: categories,
          y: noValues,
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
            size: 13,
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
      barmode: 'group',
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
      graphId="PersonIncorporatesSustainabilityByExperience"
      processor={processor}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
      dataExtractor={extractPersonIncorporatesSustainabilityByExperienceData}
      comparisonStrategy={comparisonStrategy}
    />
  );
};
