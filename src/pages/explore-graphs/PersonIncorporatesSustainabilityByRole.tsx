import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';

import { GenericChart, type ChartProcessor, type DataExtractor } from '../../components/GraphViews';
import { createDumbbellComparisonStrategy } from '../../components/comparision-components/DumbbellComparisonStrategy';
import type { HorizontalBarData } from '../../components/comparision-components/HorizontalBarComparisonStrategy';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

// --- Logic Helpers ---

const getRoleCategory = (raw: any): string | null => {
  const role = normalize(raw.role ?? '').toLowerCase();

  if (!role || role === 'n/a') return null;

  // 1. RE (Requirements Engineering)
  if (
    role.includes('requirements engineer') ||
    role.includes('business analyst') ||
    role.includes('product owner')
  ) {
    return 'RE';
  }

  // 2. Management
  if (
    role.includes('team lead') ||
    role.includes('project manager') ||
    role.includes('executive') ||
    role.includes('ceo') ||
    role.includes('owner') ||
    role.includes('cto')
  ) {
    return 'Management';
  }

  // 3. Tech
  if (
    role.includes('devops') ||
    role.includes('developer') ||
    role.includes('software architect') ||
    role.includes('tester') ||
    role.includes('qa engineer')
  ) {
    return 'Tech';
  }

  // 4. Research
  if (role.includes('researcher') || role.includes('educator')) {
    return 'Research';
  }

  // If no match, return null
  return 'Other';
};

const getYesNo = (raw: any) => {
  const val = normalize(raw.personIncorporatesSustainability ?? '').toLowerCase();
  if (val === 'yes') return 'yes';
  if (val === 'no') return 'no';
  return null;
};

const sortOrder = ['Management', 'RE', 'Research', 'Tech'];

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

const extractPersonIncorporatesSustainabilityByRoleData: DataExtractor<HorizontalBarData> = (
  responses
) => {
  const dataMap = new Map<string, { yes: number; no: number; total: number }>();

  responses.forEach((r) => {
    const category = getRoleCategory(r.raw);
    const yesNo = getYesNo(r.raw);

    if (!category || !yesNo) return;

    if (!dataMap.has(category)) {
      dataMap.set(category, { yes: 0, no: 0, total: 0 });
    }

    const entry = dataMap.get(category)!;
    entry.total++;
    entry[yesNo]++;
  });

  const sortedEntries = Array.from(dataMap.entries()).sort((a, b) => {
    const idxA = sortOrder.indexOf(a[0]);
    const idxB = sortOrder.indexOf(b[0]);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a[0].localeCompare(b[0]);
  });

  const items: { label: string; value: number }[] = [];
  const globalTotal = sortedEntries.reduce((acc, [, stats]) => acc + stats.total, 0);

  sortedEntries.forEach(([category, stats]) => {
    const yesPct = globalTotal > 0 ? (stats.yes / globalTotal) * 100 : 0;
    const noPct = globalTotal > 0 ? (stats.no / globalTotal) * 100 : 0;

    items.push({
      label: `${category}<br>Yes`,
      value: yesPct,
    });
    items.push({
      label: `${category}<br>No`,
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

export const PersonIncorporatesSustainabilityByRole = ({
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
        const category = getRoleCategory(r.raw);
        const yesNo = getYesNo(r.raw);

        if (!category || !yesNo) return;

        if (!dataMap.has(category)) {
          dataMap.set(category, { yes: 0, no: 0, total: 0 });
        }

        const entry = dataMap.get(category)!;
        entry.total++;
        entry[yesNo]++;
      });

      const sortedEntries = Array.from(dataMap.entries()).sort((a, b) => {
        const idxA = sortOrder.indexOf(a[0]);
        const idxB = sortOrder.indexOf(b[0]);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a[0].localeCompare(b[0]);
      });

      const categories = sortedEntries.map(([cat]) => cat);
      const yesValues = sortedEntries.map(([, stats]) => stats.yes);
      const noValues = sortedEntries.map(([, stats]) => stats.no);
      const validResponses = sortedEntries.reduce((acc, [, stats]) => acc + stats.total, 0);

      const traces: Data[] = [
        {
          x: categories,
          y: yesValues,
          name: 'Yes',
          type: 'bar',
          marker: { color: palette.spring },
          text: yesValues.map((v) => (v > 0 ? v.toString() : '')),
          textposition: 'inside',
          insidetextanchor: 'middle',
          textfont: { family: 'PP Mori, sans-serif', size: 13, color: '#FFFFFF' },
          hoverinfo: 'name' as const,
        },
        {
          x: categories,
          y: noValues,
          name: 'No',
          type: 'bar',
          marker: { color: palette.mandarin },
          text: noValues.map((v) => (v > 0 ? v.toString() : '')),
          textposition: 'inside',
          insidetextanchor: 'middle',
          textfont: { family: 'PP Mori, sans-serif', size: 13, color: '#FFFFFF' },
          hoverinfo: 'name' as const,
        },
      ];

      return {
        traces,
        stats: { numberOfResponses: validResponses },
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
        title: { text: 'Role' },
        automargin: true,
        ticklen: 10,
        ticks: 'outside',
        tickcolor: 'rgba(0,0,0,0)',
      },
      yaxis: {
        title: { text: 'Count' },
        automargin: true,
      },
    }),
    []
  );

  return (
    <GenericChart
      graphId="PersonIncorporatesSustainabilityByRole"
      processor={processor}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
      dataExtractor={extractPersonIncorporatesSustainabilityByRoleData}
      comparisonStrategy={comparisonStrategy}
    />
  );
};
