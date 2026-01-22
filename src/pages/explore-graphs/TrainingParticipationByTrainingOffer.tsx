import { useMemo, useCallback } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor, type DataExtractor } from '../../components/GraphViews';
import { createDumbbellComparisonStrategy } from '../../components/comparision-components/DumbbellComparisonStrategy';
import type { HorizontalBarData } from '../../components/comparision-components/HorizontalBarComparisonStrategy';

// --- Constants & Helpers ---
const PARTICIPATION_LABELS = [
  { key: 'yes', label: 'Participated' },
  { key: 'no', label: 'Did Not Participate' },
  { key: 'no_answer', label: 'No Answer' },
] as const;

// --- The Processor Logic ---
const processTrainingParticipationByTrainingOffer: ChartProcessor = (responses, palette) => {
  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // Data structure: Map<OfferStatus, Map<ParticipationStatus, Count>>
  const offerGroups = new Map<string, Map<string, number>>();
  // Only plot these rows (The "Bars")
  const OFFER_STATUSES = ['Yes', 'No', 'Not sure'];

  // Initialize
  OFFER_STATUSES.forEach((status) => {
    offerGroups.set(status, new Map());
    PARTICIPATION_LABELS.forEach((p) => {
      offerGroups.get(status)!.set(p.label, 0);
    });
  });

  let totalRespondents = 0;

  responses.forEach((r) => {
    // 1. Determine Offer Status
    const offerRaw = norm(r.raw.organizationOffersTraining ?? '');
    let offerStatus = '';

    if (offerRaw === 'yes') offerStatus = 'Yes';
    else if (offerRaw === 'no') offerStatus = 'No';
    else if (offerRaw === 'not sure') offerStatus = 'Not sure';
    // We treat "No Answer" or n/a for Offer Status as hidden (no row),
    // but we still might count them in total if desired.
    // However, usually we only count what is displayed or what is relevant.
    // If we want to match OrganizationOffersTraining total, we might need to be careful.
    // But for now, let's focus on the segments in the visible bars.

    if (!offerStatus) return;

    // 2. Determine Participation Status
    const partRaw = norm(r.raw.participatedInTraining ?? '');
    let participationLabel = 'No Answer';

    if (partRaw === 'yes') participationLabel = 'Participated';
    else if (partRaw === 'no') participationLabel = 'Did Not Participate';
    // Else remains 'No Answer'

    // 3. Add to Plot Data
    const group = offerGroups.get(offerStatus)!;
    group.set(participationLabel, (group.get(participationLabel) ?? 0) + 1);

    totalRespondents++;
  });

  // 3. Define Colors
  const colors: Record<string, string> = {
    Participated: palette.spring,
    'Did Not Participate': palette.mandarin,
    'No Answer': palette.grey02,
  };

  // 4. Build Traces
  const traces: Data[] = PARTICIPATION_LABELS.map((pDef) => {
    const label = pDef.label;

    // Y-axis: Offer Status (Yes, No, Not sure) - Reversed for top-down visual
    const yValues = [...OFFER_STATUSES].reverse();
    const xValues = yValues.map((status) => offerGroups.get(status)?.get(label) ?? 0);

    return {
      type: 'bar',
      name: label,
      orientation: 'h',
      y: yValues,
      x: xValues,
      marker: {
        color: colors[label],
      },
      text: xValues.map((v) => (v > 0 ? v.toString() : '')),
      textposition: 'inside',
      insidetextanchor: 'middle',
      textfont: {
        family: 'PP Mori, sans-serif',
        size: 13,
        color: '#FFFFFF',
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
export const TrainingParticipationByTrainingOffer = ({
  onBack,
  showBackButton = true,
}: {
  onBack: () => void;
  showBackButton?: boolean;
}) => {
  const layout = useMemo<Partial<Layout>>(
    () => ({
      barmode: 'stack',
      bargap: 0.15,
      uniformtext: { mode: 'show', minsize: 13 },
      margin: { t: 40, r: 20, b: 60, l: 100 },
      xaxis: {
        title: { text: 'Number of Respondents' },
        automargin: true,
      },
      yaxis: {
        title: { text: 'Org. Offers Training?', standoff: 20 },
        automargin: true,
        ticks: 'outside',
        ticklen: 10,
        tickcolor: 'rgba(0,0,0,0)',
      },
      legend: {
        title: { text: 'Individual Training Participation' },
        orientation: 'h',
        yanchor: 'bottom',
        y: 1.02,
        xanchor: 'right',
        x: 1,
        traceorder: 'normal',
      },
    }),
    []
  );

  const dataExtractor = useCallback<DataExtractor<HorizontalBarData>>((responses) => {
    const offerStats = new Map<string, { yes: number; no: number }>();
    let totalValidResponses = 0;
    const norm = (v: string) => v?.trim().toLowerCase() ?? '';

    responses.forEach((r) => {
      const offerRaw = norm(r.raw.organizationOffersTraining ?? '');
      let offerStatus = '';
      if (offerRaw === 'yes') offerStatus = 'Yes';
      else if (offerRaw === 'no') offerStatus = 'No';
      else if (offerRaw === 'not sure') offerStatus = 'Not sure';

      if (!offerStatus) return;

      // Count all valid offer status responses towards the total, matching the main chart
      totalValidResponses++;

      if (!offerStats.has(offerStatus)) {
        offerStats.set(offerStatus, { yes: 0, no: 0 });
      }

      const participated = norm(r.raw.participatedInTraining ?? '');
      const counts = offerStats.get(offerStatus)!;

      if (participated === 'yes') counts.yes++;
      else if (participated === 'no') counts.no++;
    });

    const items: { label: string; value: number }[] = [];

    offerStats.forEach((counts, status) => {
      // Calculate percentages based on TOTAL valid responses (Grand Total)
      const yesPct = totalValidResponses > 0 ? (counts.yes / totalValidResponses) * 100 : 0;
      const noPct = totalValidResponses > 0 ? (counts.no / totalValidResponses) * 100 : 0;

      if (yesPct > 0) items.push({ label: `Offers: ${status} - Participated`, value: yesPct });
      if (noPct > 0) items.push({ label: `Offers: ${status} - Did Not Participate`, value: noPct });
    });

    return {
      items,
      stats: { numberOfResponses: totalValidResponses },
    };
  }, []);

  return (
    <GenericChart
      graphId="TrainingParticipationByTrainingOffer"
      processor={processTrainingParticipationByTrainingOffer}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
      dataExtractor={dataExtractor}
      comparisonStrategy={comparisonStrategy}
    />
  );
};
