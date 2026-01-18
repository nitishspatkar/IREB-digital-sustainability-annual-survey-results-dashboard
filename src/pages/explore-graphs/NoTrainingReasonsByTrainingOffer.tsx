import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor } from '../../components/GraphViews';

// --- Constants & Helpers ---
const TRAINING_REASONS = [
  { key: 'orgNoTrainingLackAwareness', label: 'Lack of awareness' },
  { key: 'orgNoTrainingLackUnderstanding', label: 'Lack of understanding' },
  { key: 'orgNoTrainingNoDemand', label: 'No demand from employees' },
  { key: 'orgNoTrainingLimitedBudget', label: 'Limited budget/resources' },
  { key: 'orgNoTrainingNotPriority', label: 'Not a priority' },
  { key: 'orgNoTrainingNotSure', label: 'Not sure' },
  { key: 'orgNoTrainingOther', label: 'Other' },
] as const;

// --- The Processor Logic ---
const processNoTrainingReasonsByTrainingOffer: ChartProcessor = (responses, palette) => {
  // Map<TrainingOfferStatus, Map<ReasonLabel, count>>
  const offerStats = new Map<string, Map<string, number>>();
  // Map<TrainingOfferStatus, totalRespondentsInGroup>
  const offerTotals = new Map<string, number>();

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  // Initialize stats for known offer statuses
  const OFFER_STATUSES = ['Yes', 'No', 'Not sure', 'No Answer'];
  OFFER_STATUSES.forEach((status) => {
    offerStats.set(status, new Map());
    offerTotals.set(status, 0);
    TRAINING_REASONS.forEach((reason) => {
      offerStats.get(status)!.set(reason.label, 0);
    });
  });

  // 1. Parse Data
  responses.forEach((r) => {
    const offerStatusRaw = norm(r.raw.organizationOffersTraining ?? '');
    let offerStatus = 'No Answer';

    if (offerStatusRaw === 'yes') offerStatus = 'Yes';
    else if (offerStatusRaw === 'no') offerStatus = 'No';
    else if (offerStatusRaw === 'not sure') offerStatus = 'Not sure';

    // Check if they answered any reason
    let hasReason = false;

    TRAINING_REASONS.forEach((reasonDef) => {
      let isReasonSelected = false;
      if (reasonDef.key === 'orgNoTrainingOther') {
        const otherValue = norm(r.raw.orgNoTrainingOther);
        isReasonSelected = otherValue.length > 0 && otherValue !== 'n/a';
      } else {
        isReasonSelected = norm(r.raw[reasonDef.key]) === 'yes';
      }

      if (isReasonSelected) {
        hasReason = true;
        const currentCount = offerStats.get(offerStatus)!.get(reasonDef.label) ?? 0;
        offerStats.get(offerStatus)!.set(reasonDef.label, currentCount + 1);
      }
    });

    if (hasReason) {
      offerTotals.set(offerStatus, (offerTotals.get(offerStatus) ?? 0) + 1);
    }
  });

  const colors: Record<string, string> = {
    Yes: palette.spring,
    No: palette.mandarin,
    'Not sure': palette.grey02,
    'No Answer': palette.grey,
  };

  // 3. Build Traces
  // We will have 3 traces (Yes, No, Not sure), each containing values for all Reasons.

  const traces: Data[] = OFFER_STATUSES.map((status) => {
    const yValues = TRAINING_REASONS.map((r) => r.label).reverse();
    const xValues = TRAINING_REASONS.map(
      (r) => offerStats.get(status)?.get(r.label) ?? 0
    ).reverse();

    return {
      type: 'bar',
      name: status,
      orientation: 'h',
      y: yValues,
      x: xValues,
      marker: {
        color: colors[status],
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

  const totalRespondents = Array.from(offerTotals.values()).reduce((a, b) => a + b, 0);

  return {
    stats: { numberOfResponses: totalRespondents },
    traces: traces,
  };
};

// --- The Component ---
export const NoTrainingReasonsByTrainingOffer = ({
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
      margin: { t: 40, r: 20, b: 60, l: 200 }, // Left margin for Reason labels
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
        title: { text: 'Org. offers training?' },
        orientation: 'h',
        yanchor: 'bottom',
        y: 1.02,
        xanchor: 'right',
        x: 1,
      },
    }),
    []
  );

  return (
    <GenericChart
      graphId="NoTrainingReasonsByTrainingOffer"
      processor={processNoTrainingReasonsByTrainingOffer}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
    />
  );
};
