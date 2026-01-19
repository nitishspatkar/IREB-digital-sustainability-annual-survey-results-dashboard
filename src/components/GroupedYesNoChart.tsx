import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor } from './GraphViews';
import type { SurveyRecord } from '../data/data-parsing-logic/SurveyCsvParser.ts';
import type { GraphId } from '../hooks/useGraphDescription';

type Props = {
  graphId: GraphId;
  onBack?: () => void;
  showBackButton?: boolean;
  // Logic to extract the category (X-axis) from a response. Return null to skip.
  getCategory: (raw: Readonly<SurveyRecord>) => string | null;
  // Logic to extract 'yes' or 'no'. Return null to skip.
  getYesNo: (raw: Readonly<SurveyRecord>) => 'yes' | 'no' | null;
  // Optional: Custom sort order for categories
  sortOrder?: string[];
  // Optional: Override layout
  layoutOverrides?: Partial<Layout>;
};

export const GroupedYesNoChart = ({
  graphId,
  onBack,
  showBackButton = true,
  getCategory,
  getYesNo,
  sortOrder,
  layoutOverrides,
}: Props) => {
  const processor: ChartProcessor = useMemo(
    () => (responses, palette) => {
      const dataMap = new Map<string, { yes: number; no: number; total: number }>();

      responses.forEach((r) => {
        const category = getCategory(r.raw);
        const yesNo = getYesNo(r.raw);

        if (!category || !yesNo) return;

        if (!dataMap.has(category)) {
          dataMap.set(category, { yes: 0, no: 0, total: 0 });
        }

        const entry = dataMap.get(category)!;
        entry.total++;
        entry[yesNo]++;
      });

      // Sort categories
      const sortedEntries = Array.from(dataMap.entries()).sort((a, b) => {
        if (sortOrder) {
          const idxA = sortOrder.indexOf(a[0]);
          const idxB = sortOrder.indexOf(b[0]);
          // If both are in the list, sort by index
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          // If only one is in the list, prioritize it
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
        }
        // Fallback to alphabetical
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
          marker: { color: palette.spring }, // Green
          text: yesValues.map((v) => (v > 0 ? v.toString() : '')),
          textposition: 'inside',
          insidetextanchor: 'middle',
          textfont: { family: 'PP Mori, sans-serif', size: 13, color: '#FFFFFF' },
          hoverinfo: 'name',
        },
        {
          x: categories,
          y: noValues,
          name: 'No',
          type: 'bar',
          marker: { color: palette.mandarin }, // Red/Orange
          text: noValues.map((v) => (v > 0 ? v.toString() : '')),
          textposition: 'inside',
          insidetextanchor: 'middle',
          textfont: { family: 'PP Mori, sans-serif', size: 13, color: '#FFFFFF' },
          hoverinfo: 'name',
        },
      ];

      return {
        traces,
        stats: { numberOfResponses: validResponses },
      };
    },
    [getCategory, getYesNo, sortOrder]
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
      },
      xaxis: {
        automargin: true,
        ticklen: 10,
        ticks: 'outside',
        tickcolor: 'rgba(0,0,0,0)',
      },
      yaxis: {
        title: { text: 'Count' },
        automargin: true,
      },
      ...layoutOverrides,
    }),
    [layoutOverrides]
  );

  return (
    <GenericChart
      graphId={graphId}
      processor={processor}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
    />
  );
};
