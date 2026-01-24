import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor, type DataExtractor } from '../../components/GraphViews';
import { createDumbbellComparisonStrategy } from '../../components/comparision-components/DumbbellComparisonStrategy';
import type { HorizontalBarData } from '../../components/comparision-components/HorizontalBarComparisonStrategy';

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

const norm = (v: string) => v?.trim().toLowerCase() ?? '';

const extractNoTrainingReasonsByTrainingOfferData: DataExtractor<HorizontalBarData> = (
  responses
) => {
  const offerCounts = new Map<string, Map<string, number>>();
  const offerTotals = new Map<string, number>();
  let totalValidResponses = 0;

  // Initialize Maps
  const OFFER_STATUSES = ['Yes', 'No', 'Not sure', 'No Answer'];
  OFFER_STATUSES.forEach((status) => {
    offerCounts.set(status, new Map());
    offerTotals.set(status, 0);
  });

  responses.forEach((r) => {
    const offerStatusRaw = norm(r.raw.organizationOffersTraining ?? '');
    let offerStatus = 'No Answer';

    if (offerStatusRaw === 'yes') offerStatus = 'Yes';
    else if (offerStatusRaw === 'no') offerStatus = 'No';
    else if (offerStatusRaw === 'not sure') offerStatus = 'Not sure';

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
        const currentCount = offerCounts.get(offerStatus)!.get(reasonDef.label) ?? 0;
        offerCounts.get(offerStatus)!.set(reasonDef.label, currentCount + 1);
      }
    });

    if (hasReason) {
      totalValidResponses++;
      offerTotals.set(offerStatus, (offerTotals.get(offerStatus) ?? 0) + 1);
    }
  });

  const items: { label: string; value: number }[] = [];

  // Sort logical order for display
  const SORTED_OFFER_STATUSES = ['Yes', 'No', 'Not sure', 'No Answer'];

  SORTED_OFFER_STATUSES.forEach((status) => {
    const reasonsMap = offerCounts.get(status)!;
    // Calculate percentages based on the total number of respondents who answered this section (Grand Total)
    // This allows comparing the prevalence of reasons across different offer statuses relative to the whole population
    reasonsMap.forEach((count, reasonLabel) => {
      if (totalValidResponses > 0) {
        const pct = (count / totalValidResponses) * 100;
        items.push({ label: `${status}<br>${reasonLabel}`, value: pct });
      }
    });
  });

  return {
    items,
    stats: {
      numberOfResponses: totalValidResponses,
    },
  };
};

const baseComparisonStrategy = createDumbbellComparisonStrategy({
  normalizeToPercentage: false,
  formatAsPercentage: true,
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
      dtick: 1, // Force display of all labels
    };

    result.layout.xaxis = {
      ...result.layout.xaxis,
      automargin: true,
      title: {
        ...(result.layout.xaxis?.title || {}),
        standoff: 20,
      },
    };

    // Dynamic height adjustment
    const itemCount = (result.traces[1] as Data & { y: string[] }).y?.length || 0;
    const dynamicHeight = Math.max(520, itemCount * 50 + 100);

    result.layout.height = dynamicHeight;
  }

  return result;
};

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
        traceorder: 'normal',
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
      dataExtractor={extractNoTrainingReasonsByTrainingOfferData}
      comparisonStrategy={comparisonStrategy}
    />
  );
};
