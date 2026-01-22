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

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

// --- The Processor Logic ---
const processTrainingParticipationByRole: ChartProcessor = (responses, palette) => {
  const roleParticipationStats = new Map<string, Map<string, number>>();
  const roleTotals = new Map<string, number>();

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // 1. Parse Data
  responses.forEach((r) => {
    const role = normalize(r.raw.role ?? '');
    const participatedInTraining = norm(r.raw.participatedInTraining);

    if (!role || role.toLowerCase() === 'n/a') {
      return;
    }

    // Filter out responses that don't have a valid Yes/No answer for training
    if (participatedInTraining !== 'yes' && participatedInTraining !== 'no') {
      return;
    }

    if (!roleParticipationStats.has(role)) {
      roleParticipationStats.set(role, new Map());
      roleTotals.set(role, 0);
    }
    roleTotals.set(role, (roleTotals.get(role) ?? 0) + 1);

    const participationMap = roleParticipationStats.get(role)!;

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
  const sortedRoles = Array.from(roleTotals.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([role]) => role);

  const totalRespondents = Array.from(roleTotals.values()).reduce((a, b) => a + b, 0);

  // 3. Define Colors for Participation
  const participationColors: Record<string, string> = {
    Participated: palette.spring,
    'Did Not Participate': palette.mandarin,
  };

  // 4. Build Traces (One per Participation type)
  const traces: Data[] = TRAINING_PARTICIPATION_TEMPLATE.map((participationDef) => {
    const participationLabel = participationDef.label;
    const xValues = sortedRoles.map(
      (role) => roleParticipationStats.get(role)?.get(participationLabel) ?? 0
    );

    return {
      type: 'bar',
      name: participationLabel,
      orientation: 'h',
      y: sortedRoles,
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
        color: '#FFFFFF', // White text for contrast inside bars
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
export const TrainingParticipationByRole = ({
  onBack,
  showBackButton = true,
}: {
  onBack: () => void;
  showBackButton?: boolean;
}) => {
  // Static layout overrides
  const layout = useMemo<Partial<Layout>>(
    () => ({
      barmode: 'stack', // Stacked bars
      bargap: 0.15, // Thicker bars
      margin: { t: 40, r: 20, b: 60, l: 200 }, // Left margin for Roles
      uniformtext: {
        mode: 'show', // Versteckt Zahlen, die nicht passen, statt sie zu verkleinern
        minsize: 10, // Muss identisch mit Ihrer textfont.size sein
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

  const dataExtractor = useCallback<DataExtractor<HorizontalBarData>>((responses) => {
    const roleStats = new Map<string, { yes: number; no: number }>();
    let totalValidResponses = 0;

    responses.forEach((r) => {
      const role = normalize(r.raw.role ?? '');
      const participated = r.raw.participatedInTraining?.trim().toLowerCase();

      if (!role || role.toLowerCase() === 'n/a') return;
      if (participated !== 'yes' && participated !== 'no') return;

      totalValidResponses++;

      if (!roleStats.has(role)) {
        roleStats.set(role, { yes: 0, no: 0 });
      }

      const counts = roleStats.get(role)!;
      if (participated === 'yes') {
        counts.yes++;
      } else {
        counts.no++;
      }
    });

    const items: { label: string; value: number }[] = [];

    roleStats.forEach((counts, role) => {
      // Calculate percentages based on TOTAL valid responses (Grand Total)
      const yesPct = totalValidResponses > 0 ? (counts.yes / totalValidResponses) * 100 : 0;
      const noPct = totalValidResponses > 0 ? (counts.no / totalValidResponses) * 100 : 0;

      if (yesPct > 0) items.push({ label: `${role} - Participated`, value: yesPct });
      if (noPct > 0) items.push({ label: `${role} - Did Not Participate`, value: noPct });
    });

    return {
      items,
      stats: { numberOfResponses: totalValidResponses },
    };
  }, []);

  return (
    <GenericChart
      graphId="TrainingParticipationByRole"
      processor={processTrainingParticipationByRole}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
      dataExtractor={dataExtractor}
      comparisonStrategy={comparisonStrategy}
    />
  );
};
