import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';

import { GenericChart, type ChartProcessor } from '../../components/GraphViews';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

export const PersonIncorporatesSustainabilityByExperience = ({
  onBack,
  showBackButton = true,
}: {
  onBack?: () => void;
  showBackButton?: boolean;
}) => {
  const processor: ChartProcessor = useMemo(
    () => (responses, palette) => {
      const dataMap = new Map<string, { yes: number; no: number; total: number }>();

      responses.forEach((r) => {
        const experience = normalize(r.raw.professionalExperienceYears ?? '');
        const incorporates = normalize(r.raw.personIncorporatesSustainability ?? '').toLowerCase();

        if (!experience || experience.toLowerCase() === 'n/a') return;
        if (incorporates !== 'yes' && incorporates !== 'no') return;

        if (!dataMap.has(experience)) {
          dataMap.set(experience, { yes: 0, no: 0, total: 0 });
        }

        const entry = dataMap.get(experience)!;
        entry.total++;

        if (incorporates === 'yes') {
          entry.yes++;
        } else if (incorporates === 'no') {
          entry.no++;
        }
      });

      // Sort experience groups
      const sortedExperience = Array.from(dataMap.entries()).sort((a, b) => {
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

      const categories = sortedExperience.map(([exp]) => exp);
      const yesValues = sortedExperience.map(([, stats]) => stats.yes);
      const noValues = sortedExperience.map(([, stats]) => stats.no);
      const validResponses = sortedExperience.reduce((acc, [, stats]) => acc + stats.total, 0);

      const traces: Data[] = [
        {
          x: categories,
          y: yesValues,
          name: 'Yes',
          type: 'bar',
          marker: {
            color: palette.spring,
          },
          text: yesValues.map((v) => (v > 0 ? v.toString() : '')),
          textposition: 'inside',
          insidetextanchor: 'middle',
          textfont: {
            family: 'PP Mori, sans-serif',
            size: 13,
            color: palette.grey,
          },
          hoverinfo: 'name' as const,
        },
        {
          x: categories,
          y: noValues,
          name: 'No',
          type: 'bar',
          marker: {
            color: palette.mandarin,
          },
          text: noValues.map((v) => (v > 0 ? v.toString() : '')),
          textposition: 'inside',
          insidetextanchor: 'middle',
          textfont: {
            family: 'PP Mori, sans-serif',
            size: 12,
            color: palette.grey,
          },
          hoverinfo: 'name' as const,
        },
      ];

      return {
        traces,
        stats: {
          numberOfResponses: validResponses,
        },
      };
    },
    []
  );

  const layout = useMemo<Partial<Layout>>(
    () => ({
      barmode: 'group',
      margin: { t: 40, r: 20, b: 60, l: 60 },
      legend: {
        orientation: 'h',
        y: 1.1,
        x: 0,
      },
      xaxis: {
        automargin: true,
        ticks: 'outside',
        ticklen: 10,
        tickcolor: 'rgba(0,0,0,0)',
      },
      yaxis: {
        title: {
          text: 'Number of Respondents',
        },
      },
    }),
    []
  );

  return (
    <GenericChart
      graphId="PersonIncorporatesSustainabilityByExperience"
      processor={processor}
      layout={layout}
      isEmbedded={true}
      onBack={showBackButton ? onBack : undefined}
    />
  );
};
