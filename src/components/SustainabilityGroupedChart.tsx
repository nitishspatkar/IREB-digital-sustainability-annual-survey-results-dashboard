import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor } from './GraphViews';
import type { GraphId } from '../hooks/useGraphDescription';
import type { SurveyRecord } from '../data/data-parsing-logic/SurveyCsvParser';

// --- Shared Constants ---
const DEFAULT_DIMENSIONS = [
  { key: 'considerEnvironmental', label: 'Environmental' },
  { key: 'considerSocial', label: 'Social' },
  { key: 'considerIndividual', label: 'Individual' },
  { key: 'considerEconomic', label: 'Economic' },
  { key: 'considerTechnical', label: 'Technical' },
] as const;

const norm = (v: string) => v?.trim().toLowerCase() ?? '';

interface DimensionDef {
  key: string; // Using string to allow flexible keys from SurveyRecord
  label: string;
}

interface Props {
  graphId: GraphId;
  groups: string[];
  // Function to determine which group a response belongs to
  getGroup: (rawResponse: SurveyRecord) => string | null;
  onBack?: () => void;
  showBackButton?: boolean;
  dimensions?: DimensionDef[];
}

export const SustainabilityGroupedChart = ({
  graphId,
  groups,
  getGroup,
  onBack,
  showBackButton = true,
  dimensions = DEFAULT_DIMENSIONS as unknown as DimensionDef[],
}: Props) => {
  // 1. Create the Processor dynamically based on props
  const processor: ChartProcessor = useMemo(
    () => (responses, palette) => {
      // Filter
      const filtered = responses.filter(
        (r) => norm(r.raw.organizationIncorporatesSustainablePractices) === 'yes'
      );

      // Initialize Data Map
      const statsMap = new Map<string, Map<string, { yes: number; total: number }>>();
      groups.forEach((g) => {
        const dimMap = new Map();
        dimensions.forEach((d) => dimMap.set(d.key, { yes: 0, total: 0 }));
        statsMap.set(g, dimMap);
      });

      // Aggregate
      filtered.forEach((r) => {
        const groupName = getGroup(r.raw);
        if (!groupName || !statsMap.has(groupName)) return;

        const dimMap = statsMap.get(groupName)!;
        dimensions.forEach((dim) => {
          // Cast strictly typed key to string access for SurveyRecord
          const val = norm((r.raw as any)[dim.key] ?? '');
          const s = dimMap.get(dim.key)!;
          s.total++;
          if (val === 'yes') s.yes++;
        });
      });

      // Build Plotly Arrays
      const xValues: number[] = [];
      const yesValues: number[] = [];
      const noValues: number[] = [];
      const hoverYes: string[] = [];
      const hoverNo: string[] = [];

      let currentX = 0;
      const GAP = 1;

      groups.forEach((g) => {
        dimensions.forEach((dim) => {
          const s = statsMap.get(g)!.get(dim.key)!;
          const yesPct = s.total > 0 ? (s.yes / s.total) * 100 : 0;
          const noPct = s.total > 0 ? ((s.total - s.yes) / s.total) * 100 : 0;

          xValues.push(currentX);
          yesValues.push(yesPct);
          noValues.push(noPct);

          const h = `<b>${g}</b><br>${dim.label}`;
          hoverYes.push(`${h}<br>Yes: ${s.yes} (${yesPct.toFixed(1)}%)`);
          hoverNo.push(`${h}<br>No: ${s.total - s.yes} (${noPct.toFixed(1)}%)`);
          currentX++;
        });
        currentX += GAP;
      });

      return {
        stats: { numberOfResponses: filtered.length, totalEligible: responses.length },
        traces: [
          {
            type: 'bar',
            name: 'Yes',
            x: xValues,
            y: yesValues,
            marker: { color: palette.spring },
            hovertemplate: '%{hovertext}<extra></extra>',
            hovertext: hoverYes,
          },
          {
            type: 'bar',
            name: 'No',
            x: xValues,
            y: noValues,
            marker: { color: palette.mandarin },
            hovertemplate: '%{hovertext}<extra></extra>',
            hovertext: hoverNo,
          },
        ] as Data[],
      };
    },
    [groups, getGroup, dimensions]
  );

  // 2. Create Layout dynamically based on props
  const layout = useMemo<Partial<Layout>>(() => {
    const barsPerGroup = dimensions.length;
    // Calculate center tick position: (start + end) / 2
    // Start is i * (bars + gap), End is start + (bars - 1)
    const stride = barsPerGroup + 1;
    const tickVals = groups.map((_, i) => i * stride + (barsPerGroup - 1) / 2);

    return {
      barmode: 'stack',
      bargap: 0,
      xaxis: {
        tickmode: 'array',
        tickvals: tickVals,
        ticktext: groups,
        fixedrange: true,
      },
      yaxis: { range: [0, 100], ticksuffix: '%', fixedrange: true },
      legend: { orientation: 'h', y: 1.02, x: 1, xanchor: 'right' },
      margin: { t: 40, r: 20, b: 80, l: 60 },
    };
  }, [groups, dimensions]);

  return (
    <GenericChart
      graphId={graphId}
      processor={processor}
      layout={layout}
      isEmbedded={showBackButton}
      onBack={showBackButton ? onBack : undefined}
      showResponseStats={false}
    />
  );
};
