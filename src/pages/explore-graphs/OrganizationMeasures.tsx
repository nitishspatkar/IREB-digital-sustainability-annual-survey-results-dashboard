import { GenericChart } from '../../components/GraphViews';
import type { ChartProcessor } from '../../components/GraphViews';
import type { SurveyResponse } from '../../data/data-parsing-logic/SurveyResponse';
import type { SurveyColumnKey } from '../../data/data-parsing-logic/SurveyColumnDefinitions';
import type { Data } from 'plotly.js';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

interface OrganizationMeasure {
  key: SurveyColumnKey;
  label: string;
  filter?: (r: SurveyResponse) => boolean;
}

const measures: OrganizationMeasure[] = [
  {
    key: 'organizationDepartmentCoordination',
    label: 'Sustainability coordination',
    filter: (r: SurveyResponse) =>
      normalize(r.raw.organizationIncorporatesSustainablePractices ?? '').toLowerCase() === 'yes',
  },
  {
    key: 'organizationHasDigitalSustainabilityGoals',
    label: 'Goals or benchmarks',
  },
  {
    key: 'organizationHasSustainabilityTeam',
    label: 'CSR representatives',
  },
  {
    key: 'organizationIncorporatesSustainablePractices',
    label: 'Development practices',
  },
  {
    key: 'organizationOffersTraining',
    label: 'Training and resources',
  },
  {
    key: 'organizationReportsOnSustainability',
    label: 'Sustainability reporting',
  },
];

const processData: ChartProcessor = (responses, palette) => {
  const data = measures.map((m) => ({
    label: m.label,
    yes: 0,
    no: 0,
    notSure: 0,
  }));

  responses.forEach((r) => {
    measures.forEach((m, index) => {
      // Apply filter if exists
      if (m.filter && !m.filter(r)) {
        return;
      }

      const rawValue = normalize(r.raw[m.key] ?? '');
      const lower = rawValue.toLowerCase();

      if (lower === 'yes') {
        data[index].yes++;
      } else if (lower === 'no') {
        data[index].no++;
      } else if (lower === 'not sure') {
        data[index].notSure++;
      }
    });
  });

  // Sort by Yes percentage ascending (renders as biggest at top)
  data.sort((a, b) => {
    const totalA = a.yes + a.no + a.notSure;
    const totalB = b.yes + b.no + b.notSure;
    const pctA = totalA > 0 ? a.yes / totalA : 0;
    const pctB = totalB > 0 ? b.yes / totalB : 0;
    return pctA - pctB;
  });

  const labels = data.map((d) => d.label);
  const yesValues = data.map((d) => d.yes);
  const noValues = data.map((d) => d.no);
  const notSureValues = data.map((d) => d.notSure);

  return {
    traces: [
      {
        name: 'No',
        type: 'bar',
        x: noValues,
        y: labels,
        orientation: 'h',
        marker: { color: palette.mandarin },
        text: noValues.map((v) => (v > 0 ? v.toString() : '')),
        textposition: 'inside',
        insidetextanchor: 'middle',
        textfont: {
          family: 'PP Mori, sans-serif',
          size: 13,
        },
        hovertemplate: '%{fullData.name}: %{x:.2f}%<extra></extra>',
      },
      {
        name: 'Not sure',
        type: 'bar',
        x: notSureValues,
        y: labels,
        orientation: 'h',
        marker: { color: palette.grey02 },
        text: notSureValues.map((v) => (v > 0 ? v.toString() : '')),
        textposition: 'inside',
        insidetextanchor: 'middle',
        textfont: {
          family: 'PP Mori, sans-serif',
          size: 13,
        },
        hovertemplate: '%{fullData.name}: %{x:.2f}%<extra></extra>',
      },
      {
        name: 'Yes',
        type: 'bar',
        x: yesValues,
        y: labels,
        orientation: 'h',
        marker: { color: palette.spring },
        text: yesValues.map((v) => (v > 0 ? v.toString() : '')),
        textposition: 'inside',
        insidetextanchor: 'middle',
        textfont: {
          family: 'PP Mori, sans-serif',
          size: 13,
        },
        hovertemplate: '%{fullData.name}: %{x:.2f}%<extra></extra>',
      },
    ] as unknown as Data[],
    items: undefined,
    stats: {
      numberOfResponses: responses.length,
    },
  };
};

const OrganizationMeasures = ({
  onBack,
  showBackButton = true,
}: {
  onBack: () => void;
  showBackButton?: boolean;
}) => {
  return (
    <GenericChart
      graphId="OrganizationMeasures"
      processor={processData}
      layout={{
        barnorm: 'percent',
        margin: { t: 50, r: 20, b: 60, l: 160 },
        xaxis: {
          title: { text: 'Number of Respondents' },
          automargin: true,
          ticksuffix: '%',
        },
        yaxis: {
          automargin: true,
          ticks: 'outside',
          ticklen: 10,
          tickcolor: 'rgba(0,0,0,0)',
        },
        barmode: 'stack',
        showlegend: true,
        legend: {
          orientation: 'h',
          yanchor: 'bottom',
          y: 1.02,
          xanchor: 'right',
          x: 1,
        },
      }}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
      showResponseStats={false}
    />
  );
};

export default OrganizationMeasures;
