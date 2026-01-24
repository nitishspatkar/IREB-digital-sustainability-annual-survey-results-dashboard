import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { GenericChart, type ChartProcessor, type DataExtractor } from '../../components/GraphViews';
import { createDumbbellComparisonStrategy } from '../../components/comparision-components/DumbbellComparisonStrategy';
import type { HorizontalBarData } from '../../components/comparision-components/HorizontalBarComparisonStrategy';

// --- Data Extraction for Comparison (Dumbbell) ---
const extractPersonIncorporatesSustainabilityByOrgGoalsData: DataExtractor<HorizontalBarData> = (
  responses
) => {
  const counts = new Map<string, { yes: number; no: number }>();
  let totalValidResponses = 0;

  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  responses.forEach((r) => {
    const orgGoals = norm(r.raw.organizationHasDigitalSustainabilityGoals ?? '');
    const personInc = norm(r.raw.personIncorporatesSustainability ?? '');

    // Filter valid answers
    if (orgGoals !== 'yes' && orgGoals !== 'no' && orgGoals !== 'not sure') return;
    if (personInc !== 'yes' && personInc !== 'no') return;

    totalValidResponses++;

    // Key is the Organization Goal answer
    const key = orgGoals === 'yes' ? 'Yes' : orgGoals === 'no' ? 'No' : 'Not sure';

    if (!counts.has(key)) {
      counts.set(key, { yes: 0, no: 0 });
    }

    const entry = counts.get(key)!;
    if (personInc === 'yes') entry.yes++;
    else entry.no++;
  });

  const items: { label: string; value: number }[] = [];
  const sortOrder = ['Yes', 'Not sure', 'No'];

  sortOrder.forEach((orgGoalLabel) => {
    if (counts.has(orgGoalLabel)) {
      const entry = counts.get(orgGoalLabel)!;
      if (totalValidResponses > 0) {
        const yesPct = (entry.yes / totalValidResponses) * 100;
        const noPct = (entry.no / totalValidResponses) * 100;

        // Label: "Org Goals: <Answer>\nPerson: <Yes/No>"
        if (yesPct > 0)
          items.push({ label: `Org Goals: ${orgGoalLabel}<br>Person: Yes`, value: yesPct });
        if (noPct > 0)
          items.push({ label: `Org Goals: ${orgGoalLabel}<br>Person: No`, value: noPct });
      }
    }
  });

  return {
    items,
    stats: {
      numberOfResponses: totalValidResponses,
    },
  };
};

// --- Comparison Strategy ---
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

    // Dynamic height adjustment
    const itemCount = (result.traces[1] as Data & { y: string[] }).y?.length || 0;
    const dynamicHeight = Math.max(520, itemCount * 50 + 100);

    result.layout.height = dynamicHeight;
  }

  return result;
};

// --- Single Year Processor (Vertical Grouped Bar) ---
const processPersonIncorporatesSustainabilityByOrgGoals: ChartProcessor = (responses, palette) => {
  const dataMap = new Map<string, { yes: number; no: number; total: number }>();
  const norm = (v: string) => v?.trim().toLowerCase() ?? '';

  responses.forEach((r) => {
    const orgGoals = norm(r.raw.organizationHasDigitalSustainabilityGoals ?? '');
    const personInc = norm(r.raw.personIncorporatesSustainability ?? '');

    if (orgGoals !== 'yes' && orgGoals !== 'no' && orgGoals !== 'not sure') return;
    if (personInc !== 'yes' && personInc !== 'no') return;

    const label = orgGoals === 'yes' ? 'Yes' : orgGoals === 'no' ? 'No' : 'Not sure';

    if (!dataMap.has(label)) {
      dataMap.set(label, { yes: 0, no: 0, total: 0 });
    }

    const entry = dataMap.get(label)!;
    entry.total++;
    if (personInc === 'yes') entry.yes++;
    else entry.no++;
  });

  // Sort Order: Yes, Not sure, No
  const sortOrder = ['Yes', 'Not sure', 'No'];
  const sortedEntries = sortOrder
    .map((key) => ({ key, data: dataMap.get(key) }))
    .filter((item) => item.data !== undefined) as {
    key: string;
    data: { yes: number; no: number; total: number };
  }[];

  const categories = sortedEntries.map((item) => item.key);
  const yesValues = sortedEntries.map((item) => item.data.yes);
  const noValues = sortedEntries.map((item) => item.data.no);
  const validResponses = sortedEntries.reduce((acc, item) => acc + item.data.total, 0);

  const traces: Data[] = [
    {
      x: categories,
      y: yesValues,
      name: 'Person: Yes',
      type: 'bar',
      marker: { color: palette.spring },
      text: yesValues.map((v) => (v > 0 ? v.toString() : '')),
      textposition: 'inside',
      insidetextanchor: 'middle',
      textfont: { family: 'PP Mori, sans-serif', size: 13, color: '#FFFFFF' },
      hoverinfo: 'name',
    },
    {
      x: categories,
      y: noValues,
      name: 'Person: No',
      type: 'bar',
      marker: { color: palette.mandarin },
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
};

export const PersonIncorporatesSustainabilityByOrgGoals = ({
  onBack,
  showBackButton = true,
}: {
  onBack?: () => void;
  showBackButton?: boolean;
}) => {
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
        title: { text: 'Organization Has Sustainability Goals' },
        automargin: true,
        ticklen: 10,
        ticks: 'outside',
        tickcolor: 'rgba(0,0,0,0)',
      },
      yaxis: {
        title: { text: 'Number of Respondents' },
        automargin: true,
      },
    }),
    []
  );

  return (
    <GenericChart
      graphId="PersonIncorporatesSustainabilityByOrgGoals"
      processor={processPersonIncorporatesSustainabilityByOrgGoals}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
      dataExtractor={extractPersonIncorporatesSustainabilityByOrgGoalsData}
      comparisonStrategy={comparisonStrategy}
    />
  );
};
