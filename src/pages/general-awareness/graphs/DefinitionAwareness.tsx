import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';

import { useSurveyData } from '../../../data/data-parsing-logic/SurveyContext';
import useThemeColor from '../../../hooks/useThemeColor';
import { useGraphDescription } from '../../../hooks/useGraphDescription';
import { SurveyChart } from '../../../components/GraphViews.tsx';

type AwarenessStat = {
  label: string;
  count: number;
};

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

export const DefinitionAwareness = ({
  onExplore,
  className,
}: {
  onExplore: () => void;
  className?: string;
}) => {
  const yesColor = useThemeColor('--color-ireb-spring');
  const noColor = useThemeColor('--color-ireb-mandarin');
  const titleColor = useThemeColor('--color-ireb-grey-01');
  const tickColor = useThemeColor('--color-ireb-grey-01');

  const responses = useSurveyData();

  const stats = useMemo<AwarenessStat[]>(() => {
    const counts = new Map<string, number>();
    counts.set('Yes', 0);
    counts.set('No', 0);

    responses.forEach((r) => {
      const raw = normalize(r.raw.heardOfDigitalSustainabilityDefinition ?? '');
      const lower = raw.toLowerCase();

      if (lower === 'yes') {
        counts.set('Yes', (counts.get('Yes') ?? 0) + 1);
      } else if (lower === 'no') {
        counts.set('No', (counts.get('No') ?? 0) + 1);
      }
    });

    return [
      { label: 'Yes', count: counts.get('Yes') ?? 0 },
      { label: 'No', count: counts.get('No') ?? 0 },
    ];
  }, [responses]);

  const chartData = useMemo<Data[]>(() => {
    return [
      {
        x: stats.map((s) => s.label),
        y: stats.map((s) => s.count),
        type: 'bar',
        marker: {
          color: stats.map((s) => (s.label === 'Yes' ? yesColor : noColor)),
        },
        // --- CHANGES START HERE ---
        text: stats.map((s) => s.count.toString()),
        textposition: 'outside',
        textfont: {
          family: 'PP Mori, sans-serif',
          size: 12,
          color: tickColor,
        },
        cliponaxis: false,
        // --- CHANGES END HERE ---
        hoverinfo: 'none',
      },
    ];
  }, [stats, yesColor, noColor, tickColor]); // Added tickColor

  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 60, r: 20, b: 60, l: 48 }, // t: 60 is already good
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      xaxis: {
        tickfont: {
          family: 'PP Mori, sans-serif',
          size: 12,
          color: tickColor,
        },
      },
      yaxis: {
        title: {
          text: 'Number of Respondents',
          font: {
            family: 'PP Mori, sans-serif',
            size: 12,
            color: tickColor,
          },
        },
        tickfont: {
          family: 'PP Mori, sans-serif',
          size: 12,
          color: tickColor,
        },
      },
    }),
    [titleColor, tickColor]
  );

  const numberOfResponses = stats.reduce((sum, stat) => sum + stat.count, 0);
  const totalResponses = responses.length;
  const responseRate = totalResponses > 0 ? (numberOfResponses / totalResponses) * 100 : 0;

  const { question: graphQuestion, description } = useGraphDescription('DefinitionAwareness');
  const question = graphQuestion;

  return (
    <SurveyChart
      className={className}
      question={question}
      description={description}
      numberOfResponses={numberOfResponses}
      responseRate={responseRate}
      data={chartData}
      layout={layout}
      hasExploreData={true}
      onExplore={onExplore}
    />
  );
};

export default DefinitionAwareness;

export const DefinitionAwarenessByRole = ({ onBack }: { onBack: () => void }) => {
  const yesColor = useThemeColor('--color-ireb-spring');
  const noColor = useThemeColor('--color-ireb-mandarin');
  const tickColor = useThemeColor('--color-ireb-grey-01');
  const responses = useSurveyData();

  const { categories, yesValues, noValues, validResponses } = useMemo(() => {
    const dataMap = new Map<string, { yes: number; no: number; total: number }>();

    responses.forEach((r) => {
      const role = normalize(r.raw.role ?? '');
      const awareness = normalize(r.raw.heardOfDigitalSustainabilityDefinition ?? '').toLowerCase();

      if (!role || role.toLowerCase() === 'n/a' || !awareness) return;

      if (!dataMap.has(role)) {
        dataMap.set(role, { yes: 0, no: 0, total: 0 });
      }
      const entry = dataMap.get(role)!;
      entry.total++;
      if (awareness === 'yes') entry.yes++;
      else if (awareness === 'no') entry.no++;
    });

    // Sort ascending by total so the largest bar appears at the top in Plotly horizontal view
    const sorted = Array.from(dataMap.entries()).sort((a, b) => a[1].total - b[1].total);

    return {
      categories: sorted.map(([role]) => role),
      yesValues: sorted.map(([, stats]) => stats.yes),
      noValues: sorted.map(([, stats]) => stats.no),
      validResponses: sorted.reduce((acc, [, stats]) => acc + stats.total, 0),
    };
  }, [responses]);

  const chartData = useMemo<Data[]>(
    () => [
      {
        y: categories, // y is categories for horizontal
        x: yesValues, // x is values
        name: 'Familiar (Yes)',
        type: 'bar',
        orientation: 'h',
        marker: { color: yesColor },
        text: yesValues.map((v) => (v > 0 ? v.toString() : '')),
        textposition: 'auto',
        hoverinfo: 'name' as const,
      },
      {
        y: categories,
        x: noValues,
        name: 'Not Familiar (No)',
        type: 'bar',
        orientation: 'h',
        marker: { color: noColor },
        text: noValues.map((v) => (v > 0 ? v.toString() : '')),
        textposition: 'auto',
        hoverinfo: 'name' as const,
      },
    ],
    [categories, yesValues, noValues, yesColor, noColor]
  );

  const layout = useMemo<Partial<Layout>>(
    () => ({
      barmode: 'stack',
      margin: { t: 40, r: 20, b: 40, l: 200 }, // Increased left margin for Role names
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      legend: {
        orientation: 'h',
        y: 1.1,
        x: 0,
        font: { family: 'PP Mori, sans-serif', size: 12, color: tickColor },
      },
      xaxis: {
        tickfont: { family: 'PP Mori, sans-serif', size: 12, color: tickColor },
        title: {
          text: 'Number of Respondents',
          font: { family: 'PP Mori, sans-serif', size: 12, color: tickColor },
        },
      },
      yaxis: {
        tickfont: {
          family: 'PP Mori, sans-serif',
          size: 12,
          color: tickColor,
        },
        automargin: true,
        ticks: 'outside',
        ticklen: 10,
        tickcolor: 'rgba(0,0,0,0)',
      },
    }),
    [tickColor]
  );

  const responseRate = responses.length > 0 ? (validResponses / responses.length) * 100 : 0;
  const { question, description } = useGraphDescription('DefinitionAwarenessByRole');

  return (
    <SurveyChart
      question={question}
      description={description}
      numberOfResponses={validResponses}
      responseRate={responseRate}
      data={chartData}
      layout={layout}
      hasExploreData={false}
      showBackButton={true}
      showExploreTitle={true}
      onBack={onBack}
    />
  );
};

export const DefinitionAwarenessByAge = ({ onBack }: { onBack: () => void }) => {
  const yesColor = useThemeColor('--color-ireb-spring');
  const noColor = useThemeColor('--color-ireb-mandarin');
  const tickColor = useThemeColor('--color-ireb-grey-01');
  const responses = useSurveyData();

  const { categories, yesValues, noValues, validResponses } = useMemo(() => {
    const dataMap = new Map<string, { yes: number; no: number; total: number }>();

    responses.forEach((r) => {
      const age = normalize(r.raw.ageGroup ?? '');
      const awareness = normalize(r.raw.heardOfDigitalSustainabilityDefinition ?? '').toLowerCase();

      if (!age || age.toLowerCase() === 'n/a' || !awareness) return;

      if (!dataMap.has(age)) {
        dataMap.set(age, { yes: 0, no: 0, total: 0 });
      }
      const entry = dataMap.get(age)!;
      entry.total++;
      if (awareness === 'yes') entry.yes++;
      else if (awareness === 'no') entry.no++;
    });

    const sorted = Array.from(dataMap.entries()).sort((a, b) => {
      const aMatch = a[0].match(/^(\d+)/);
      const bMatch = b[0].match(/^(\d+)/);
      if (aMatch && bMatch) {
        return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
      }
      return a[0].localeCompare(b[0]);
    });

    return {
      categories: sorted.map(([age]) => age),
      yesValues: sorted.map(([, stats]) => stats.yes),
      noValues: sorted.map(([, stats]) => stats.no),
      validResponses: sorted.reduce((acc, [, stats]) => acc + stats.total, 0),
    };
  }, [responses]);

  const chartData = useMemo<Data[]>(
    () => [
      {
        y: categories,
        x: yesValues,
        name: 'Familiar (Yes)',
        type: 'bar',
        orientation: 'h',
        marker: { color: yesColor },
        text: yesValues.map((v) => (v > 0 ? v.toString() : '')),
        textposition: 'auto',
        hoverinfo: 'name' as const,
      },
      {
        y: categories,
        x: noValues,
        name: 'Not Familiar (No)',
        type: 'bar',
        orientation: 'h',
        marker: { color: noColor },
        text: noValues.map((v) => (v > 0 ? v.toString() : '')),
        textposition: 'auto',
        hoverinfo: 'name' as const,
      },
    ],
    [categories, yesValues, noValues, yesColor, noColor]
  );

  const layout = useMemo<Partial<Layout>>(
    () => ({
      barmode: 'stack',
      margin: { t: 40, r: 20, b: 40, l: 60 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      legend: {
        orientation: 'h',
        y: 1.1,
        x: 0,
        font: { family: 'PP Mori, sans-serif', size: 12, color: tickColor },
      },
      xaxis: {
        tickfont: { family: 'PP Mori, sans-serif', size: 12, color: tickColor },
        title: {
          text: 'Number of Respondents',
          font: { family: 'PP Mori, sans-serif', size: 12, color: tickColor },
        },
      },
      yaxis: {
        tickfont: {
          family: 'PP Mori, sans-serif',
          size: 12,
          color: tickColor,
        },
        automargin: true,
        ticks: 'outside',
        ticklen: 10,
        tickcolor: 'rgba(0,0,0,0)',
      },
    }),
    [tickColor]
  );

  const responseRate = responses.length > 0 ? (validResponses / responses.length) * 100 : 0;
  const { question, description } = useGraphDescription('DefinitionAwarenessByAge');

  return (
    <SurveyChart
      question={question}
      description={description}
      numberOfResponses={validResponses}
      responseRate={responseRate}
      data={chartData}
      layout={layout}
      hasExploreData={false}
      showBackButton={true}
      onBack={onBack}
    />
  );
};

export const DefinitionAwarenessByExperience = ({ onBack }: { onBack: () => void }) => {
  const yesColor = useThemeColor('--color-ireb-spring');
  const noColor = useThemeColor('--color-ireb-mandarin');
  const tickColor = useThemeColor('--color-ireb-grey-01');
  const responses = useSurveyData();

  const { categories, yesValues, noValues, validResponses } = useMemo(() => {
    const dataMap = new Map<string, { yes: number; no: number; total: number }>();

    responses.forEach((r) => {
      const exp = normalize(r.raw.professionalExperienceYears ?? '');
      const awareness = normalize(r.raw.heardOfDigitalSustainabilityDefinition ?? '').toLowerCase();

      if (!exp || exp.toLowerCase() === 'n/a' || !awareness) return;

      if (!dataMap.has(exp)) {
        dataMap.set(exp, { yes: 0, no: 0, total: 0 });
      }
      const entry = dataMap.get(exp)!;
      entry.total++;
      if (awareness === 'yes') entry.yes++;
      else if (awareness === 'no') entry.no++;
    });

    const sorted = Array.from(dataMap.entries()).sort((a, b) => {
      const aLabel = a[0];
      const bLabel = b[0];
      const aMatch = aLabel.match(/^(\d+)/);
      const bMatch = bLabel.match(/^(\d+)/);

      if (aLabel.startsWith('Less than')) return -1;
      if (bLabel.startsWith('Less than')) return 1;
      if (aLabel.startsWith('More than')) return 1;
      if (bLabel.startsWith('More than')) return -1;
      if (aMatch && bMatch) return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
      return aLabel.localeCompare(bLabel);
    });

    return {
      categories: sorted.map(([exp]) => exp),
      yesValues: sorted.map(([, stats]) => stats.yes),
      noValues: sorted.map(([, stats]) => stats.no),
      validResponses: sorted.reduce((acc, [, stats]) => acc + stats.total, 0),
    };
  }, [responses]);

  const chartData = useMemo<Data[]>(
    () => [
      {
        y: categories,
        x: yesValues,
        name: 'Familiar (Yes)',
        type: 'bar',
        orientation: 'h',
        marker: { color: yesColor },
        text: yesValues.map((v) => (v > 0 ? v.toString() : '')),
        textposition: 'auto',
        hoverinfo: 'name' as const,
      },
      {
        y: categories,
        x: noValues,
        name: 'Not Familiar (No)',
        type: 'bar',
        orientation: 'h',
        marker: { color: noColor },
        text: noValues.map((v) => (v > 0 ? v.toString() : '')),
        textposition: 'auto',
        hoverinfo: 'name' as const,
      },
    ],
    [categories, yesValues, noValues, yesColor, noColor]
  );

  const layout = useMemo<Partial<Layout>>(
    () => ({
      barmode: 'stack',
      margin: { t: 40, r: 20, b: 40, l: 150 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      legend: {
        orientation: 'h',
        y: 1.1,
        x: 0,
        font: { family: 'PP Mori, sans-serif', size: 12, color: tickColor },
      },
      xaxis: {
        tickfont: { family: 'PP Mori, sans-serif', size: 12, color: tickColor },
        title: {
          text: 'Number of Respondents',
          font: { family: 'PP Mori, sans-serif', size: 12, color: tickColor },
        },
      },
      yaxis: {
        tickfont: {
          family: 'PP Mori, sans-serif',
          size: 12,
          color: tickColor,
        },
        automargin: true,
        ticks: 'outside',
        ticklen: 10,
        tickcolor: 'rgba(0,0,0,0)',
      },
    }),
    [tickColor]
  );

  const responseRate = responses.length > 0 ? (validResponses / responses.length) * 100 : 0;
  const { question, description } = useGraphDescription('DefinitionAwarenessByExperience');

  return (
    <SurveyChart
      question={question}
      description={description}
      numberOfResponses={validResponses}
      responseRate={responseRate}
      data={chartData}
      layout={layout}
      hasExploreData={false}
      showBackButton={true}
      onBack={onBack}
    />
  );
};

export const DefinitionAwarenessDetails = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="space-y-12">
      <DefinitionAwarenessByRole onBack={onBack} />
      <DefinitionAwarenessByAge onBack={onBack} />
      <DefinitionAwarenessByExperience onBack={onBack} />
    </div>
  );
};
