import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';

import { GenericChart, type ChartProcessor } from '../../components/GraphViews';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

const MEASURE_COLUMNS = [
  'organizationHasDigitalSustainabilityGoals',
  'organizationHasSustainabilityTeam',
  'organizationIncorporatesSustainablePractices',
  'organizationDepartmentCoordination',
  'organizationReportsOnSustainability',
  'organizationOffersTraining',
] as const;

export const PersonIncorporatesSustainabilityByMeasureCount = ({
  onBack,
  showBackButton = true,
}: {
  onBack?: () => void;
  showBackButton?: boolean;
}) => {
  const processor: ChartProcessor = useMemo(
    () => (responses, palette) => {
      const dataMap = new Map<string, { yes: number; no: number; total: number }>();

      // Pre-fill categories to ensure they all exist even if 0 count (optional, but good for consistent order)
      const sortOrder = [
        'No sustainability',
        'Unclear communication',
        'One measure',
        'Two measures',
        'Three measures',
        'Four measures',
      ];

      sortOrder.forEach((cat) => dataMap.set(cat, { yes: 0, no: 0, total: 0 }));

      responses.forEach((r) => {
        // --- 1. Determine Category ---
        let category: string | null = null;
        const incPractices = normalize(
          r.raw.organizationIncorporatesSustainablePractices ?? ''
        ).toLowerCase();

        if (incPractices === 'no') {
          category = 'No sustainability';
        } else if (incPractices === 'not sure') {
          category = 'Unclear communication';
        } else {
          // For others (likely 'yes'), count the specific measures
          let count = 0;
          for (const col of MEASURE_COLUMNS) {
            const val = normalize(r.raw[col] ?? '').toLowerCase();
            if (val === 'yes') {
              count++;
            }
          }

          if (count === 1) category = 'One measure';
          else if (count === 2) category = 'Two measures';
          else if (count === 3) category = 'Three measures';
          else if (count >= 4) category = 'Four measures';
        }

        if (!category) return;

        // --- 2. Determine Yes/No ---
        const incorporates = normalize(r.raw.personIncorporatesSustainability ?? '').toLowerCase();
        if (incorporates !== 'yes' && incorporates !== 'no') return;

        // --- 3. Update Stats ---
        if (!dataMap.has(category)) {
          // Should be pre-filled, but just in case logic changes
          dataMap.set(category, { yes: 0, no: 0, total: 0 });
        }

        const entry = dataMap.get(category)!;
        entry.total++;
        if (incorporates === 'yes') entry.yes++;
        else entry.no++;
      });

      // Prepare data for plotting
      // We reverse the order for horizontal bars so the first item ('No sustainability') appears at the top
      // Plotly plots Y-axis from bottom (0) to top.
      const plotCategories = [...sortOrder].reverse();

      const yesValues = plotCategories.map((cat) => dataMap.get(cat)?.yes ?? 0);
      const noValues = plotCategories.map((cat) => dataMap.get(cat)?.no ?? 0);
      const validResponses = Array.from(dataMap.values()).reduce(
        (acc, stats) => acc + stats.total,
        0
      );

      const traces: Data[] = [
        {
          y: plotCategories, // Y-axis is categories
          x: yesValues, // X-axis is counts
          name: 'Yes',
          type: 'bar',
          orientation: 'h', // Horizontal bars
          marker: {
            color: palette.spring,
          },
          text: yesValues.map((v) => (v > 0 ? v.toString() : '')),
          textposition: 'inside',
          insidetextanchor: 'middle',
          textfont: {
            family: 'PP Mori, sans-serif',
            size: 13,
            color: palette.grey,
          },
          hoverinfo: 'name' as const,
        },
        {
          y: plotCategories,
          x: noValues,
          name: 'No',
          type: 'bar',
          orientation: 'h',
          marker: {
            color: palette.mandarin,
          },
          text: noValues.map((v) => (v > 0 ? v.toString() : '')),
          textposition: 'inside',
          insidetextanchor: 'middle',
          textfont: {
            family: 'PP Mori, sans-serif',
            size: 12,
            color: palette.grey,
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
      barmode: 'group', // Side-by-side
      margin: { t: 40, r: 20, b: 60, l: 160 }, // Left margin for labels
      legend: {
        orientation: 'h',
        y: 1.1,
        x: 0,
      },
      xaxis: {
        title: {
          text: 'Number of Respondents',
        },
        automargin: true,
        ticks: 'outside',
        ticklen: 10,
        tickcolor: 'rgba(0,0,0,0)',
      },
      yaxis: {
        automargin: true,
        ticksuffix: '  ', // Add padding between label and axis
      },
    }),
    []
  );

  return (
    <GenericChart
      graphId="PersonIncorporatesSustainabilityByMeasureCount"
      processor={processor}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
    />
  );
};
