import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor } from '../../components/GraphViews';
import type { SurveyRecord } from '../../data/data-parsing-logic/SurveyCsvParser';

// --- Shared Constants ---
const QUESTIONS = [
  { key: 'organizationHasDigitalSustainabilityGoals', label: 'Has Goals' },
  { key: 'organizationHasSustainabilityTeam', label: 'Has Team' },
  { key: 'organizationIncorporatesSustainablePractices', label: 'Incorporates Practices' },
  { key: 'organizationReportsOnSustainability', label: 'Reports on Sustainability' },
  { key: 'organizationOffersTraining', label: 'Offers Training' },
] as const;

const ORG_GROUPS = ['Other organizations', 'Large company', 'Research'];

const norm = (v: string) => v?.trim().toLowerCase() ?? '';

const getOrgGroup = (raw: SurveyRecord) => {
  const t = (raw.organizationType ?? '').toLowerCase();
  if (t.includes('large enterprise')) return 'Large company';
  if (t.includes('university') || t.includes('research')) return 'Research';
  if (!t || t === 'n/a') return null;
  return 'Other organizations';
};

interface Props {
  onBack?: () => void;
  showBackButton?: boolean;
}

export const OrganizationalPracticesByOrgType = ({ onBack, showBackButton = true }: Props) => {
  // Create the Processor
  const processor: ChartProcessor = useMemo(
    () => (responses, palette) => {
      // Initialize Data Map
      const statsMap = new Map<
        string,
        Map<string, { yes: number; no: number; notSure: number; total: number }>
      >();
      ORG_GROUPS.forEach((g) => {
        const qMap = new Map();
        QUESTIONS.forEach((q) => qMap.set(q.key, { yes: 0, no: 0, notSure: 0, total: 0 }));
        statsMap.set(g, qMap);
      });

      // Aggregate
      responses.forEach((r) => {
        const groupName = getOrgGroup(r.raw);
        if (!groupName || !statsMap.has(groupName)) return;

        const qMap = statsMap.get(groupName)!;
        QUESTIONS.forEach((question) => {
          // @ts-expect-error - Dynamic key access on SurveyRecord
          const val = norm(r.raw[question.key] as unknown as string);
          if (val === '' || val === 'n/a') return;

          const s = qMap.get(question.key)!;
          s.total++;
          if (val === 'yes') s.yes++;
          else if (val === 'no') s.no++;
          else if (val === 'not sure') s.notSure++;
        });
      });

      // Build Plotly Arrays
      const xValues: number[] = [];
      const yesValues: number[] = [];
      const noValues: number[] = [];
      const notSureValues: number[] = [];
      const hoverYes: string[] = [];
      const hoverNo: string[] = [];
      const hoverNotSure: string[] = [];

      let currentX = 0;
      const GAP = 1;

      ORG_GROUPS.forEach((g) => {
        QUESTIONS.forEach((question) => {
          const s = statsMap.get(g)!.get(question.key)!;
          const yesPct = s.total > 0 ? (s.yes / s.total) * 100 : 0;
          const noPct = s.total > 0 ? (s.no / s.total) * 100 : 0;
          const notSurePct = s.total > 0 ? (s.notSure / s.total) * 100 : 0;

          xValues.push(currentX);
          yesValues.push(yesPct);
          noValues.push(noPct);
          notSureValues.push(notSurePct);

          const h = `<b>${g}</b><br>${question.label}`;
          hoverYes.push(`${h}<br>Yes: ${s.yes} (${yesPct.toFixed(1)}%)`);
          hoverNo.push(`${h}<br>No: ${s.no} (${noPct.toFixed(1)}%)`);
          hoverNotSure.push(`${h}<br>Not sure: ${s.notSure} (${notSurePct.toFixed(1)}%)`);
          currentX++;
        });
        currentX += GAP;
      });

      return {
        stats: { numberOfResponses: responses.length, totalEligible: responses.length },
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
            name: 'Not sure',
            x: xValues,
            y: notSureValues,
            marker: { color: palette.grey02 },
            hovertemplate: '%{hovertext}<extra></extra>',
            hovertext: hoverNotSure,
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
    []
  );

  // Create Layout
  const layout = useMemo<Partial<Layout>>(() => {
    const barsPerGroup = QUESTIONS.length;
    const stride = barsPerGroup + 1;
    const tickVals = ORG_GROUPS.map((_, i) => i * stride + (barsPerGroup - 1) / 2);

    return {
      barmode: 'stack',
      bargap: 0,
      xaxis: {
        tickmode: 'array',
        tickvals: tickVals,
        ticktext: ORG_GROUPS,
        fixedrange: true,
      },
      yaxis: { range: [0, 100], ticksuffix: '%', fixedrange: true },
      legend: { orientation: 'h', y: 1.02, x: 1, xanchor: 'right' },
      margin: { t: 40, r: 20, b: 80, l: 60 },
    };
  }, []);

  return (
    <GenericChart
      graphId="OrganizationalPracticesByOrgType"
      processor={processor}
      layout={layout}
      isEmbedded={showBackButton}
      onBack={showBackButton ? onBack : undefined}
      showResponseStats={false}
    />
  );
};
