import useThemeColor from '../../hooks/useThemeColor.ts';
import { useSurveyData } from '../../data/data-parsing-logic/SurveyContext.tsx';
import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { useGraphDescription } from '../../hooks/useGraphDescription.ts';
import { SurveyChart } from '../../components/GraphViews.tsx';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

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
