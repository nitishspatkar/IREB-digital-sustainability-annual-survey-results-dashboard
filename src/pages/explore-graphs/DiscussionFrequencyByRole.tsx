import { useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { useSurveyData } from '../../data/data-parsing-logic/SurveyContext.tsx';
import useThemeColor from '../../hooks/useThemeColor.ts';
import { useGraphDescription } from '../../hooks/useGraphDescription.ts';
import { SurveyChart } from '../../components/GraphViews.tsx';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

// Vorlage aller möglichen Spalten.
// Spalten ohne Daten werden später automatisch herausgefiltert.
const FREQUENCY_TEMPLATE = ['daily', 'weekly', 'monthly', 'every few months', 'never', 'other'];

// Hilfsfunktion für Labels mit Umbruch
const formatLabel = (freq: string) => {
  if (freq === 'every few months') return 'Every few<br>months';
  return freq.charAt(0).toUpperCase() + freq.slice(1);
};

// Typ-Definition für Annotationen
type Annotation = {
  x: string;
  y: string;
  text: string;
  showarrow: boolean;
  font: {
    family: string;
    size: number;
    color: string;
  };
};

export const DiscussionFrequencyByRole = ({
  onBack,
  showBackButton = true,
}: {
  onBack: () => void;
  showBackButton?: boolean;
}) => {
  const responses = useSurveyData();
  const tickColor = useThemeColor('--color-ireb-grey-01');
  const berryColor = useThemeColor('--color-ireb-berry');
  const lightColor = '#F2F2F2';

  const { roles, activeFrequencies, zValues, validResponses, maxZ } = useMemo(() => {
    const roleStats = new Map<string, Map<string, number>>();
    const roleTotals = new Map<string, number>();
    const freqTotals = new Map<string, number>();

    responses.forEach((r) => {
      const role = normalize(r.raw.role ?? '');
      let frequency = normalize(r.raw.discussionFrequency ?? '').toLowerCase();

      if (!role || role.toLowerCase() === 'n/a' || !frequency || frequency === 'n/a') return;

      // --- Mapping Logik ---
      if (frequency.includes('every few months')) {
        frequency = 'every few months';
      } else if (frequency === 'monthly') {
        frequency = 'monthly';
      }

      if (!FREQUENCY_TEMPLATE.includes(frequency) && frequency !== 'other') {
        frequency = 'other';
      }

      // --- Zählen ---
      if (!roleStats.has(role)) {
        roleStats.set(role, new Map());
        roleTotals.set(role, 0);
      }
      const freqs = roleStats.get(role)!;
      freqs.set(frequency, (freqs.get(frequency) ?? 0) + 1);

      roleTotals.set(role, (roleTotals.get(role) ?? 0) + 1);
      freqTotals.set(frequency, (freqTotals.get(frequency) ?? 0) + 1);
    });

    // --- Sortieren & Filtern ---
    const sortedRoles = Array.from(roleTotals.entries())
      .sort((a, b) => a[1] - b[1])
      .map(([role]) => role);

    const activeFreqs = FREQUENCY_TEMPLATE.filter((f) => (freqTotals.get(f) ?? 0) > 0);

    const z = sortedRoles.map((role) =>
      activeFreqs.map((freq) => roleStats.get(role)?.get(freq) ?? 0)
    );

    const maxVal = Math.max(...z.flat());

    return {
      roles: sortedRoles,
      activeFrequencies: activeFreqs,
      zValues: z,
      validResponses: Array.from(roleTotals.values()).reduce((a, b) => a + b, 0),
      maxZ: maxVal,
    };
  }, [responses]);

  const displayLabels = useMemo(() => activeFrequencies.map(formatLabel), [activeFrequencies]);

  // FIX 1: Typisierung statt 'any'
  const annotations = useMemo(() => {
    const anns: Annotation[] = [];
    zValues.forEach((row, yIndex) => {
      row.forEach((val, xIndex) => {
        if (val > 0) {
          const isDarkBackground = val / maxZ > 0.4;
          anns.push({
            x: displayLabels[xIndex],
            y: roles[yIndex],
            text: val.toString(),
            showarrow: false,
            font: {
              family: 'PP Mori, sans-serif',
              size: 12,
              color: isDarkBackground ? '#FFFFFF' : tickColor,
            },
          });
        }
      });
    });
    return anns;
  }, [zValues, displayLabels, roles, maxZ, tickColor]);

  const chartData = useMemo<Data[]>(
    () => [
      {
        type: 'heatmap',
        x: displayLabels,
        y: roles,
        z: zValues,
        colorscale: [
          [0, lightColor],
          [1, berryColor],
        ],
        xgap: 2,
        ygap: 2,
        showscale: false,
        // FIX 2: 'as unknown as string[]' umgeht TS-Fehler ohne 'any' zu nutzen
        // Plotly erwartet string[], unterstützt zur Laufzeit aber string[][] für Heatmaps.
        text: zValues.map((row) =>
          row.map((v) => (v > 0 ? v.toString() : ''))
        ) as unknown as string[],
        hoverinfo: 'x+y+text' as const,
        showlegend: false,
      },
    ],
    [roles, displayLabels, zValues, berryColor, lightColor]
  );

  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 60, r: 20, b: 20, l: 220 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      annotations: annotations,
      xaxis: {
        tickfont: { family: 'PP Mori, sans-serif', size: 12, color: tickColor },
        side: 'top',
        tickangle: 0,
      },
      yaxis: {
        tickfont: { family: 'PP Mori, sans-serif', size: 12, color: tickColor },
        automargin: true,
        ticks: 'outside',
        ticklen: 10,
        tickcolor: 'rgba(0,0,0,0)',
      },
    }),
    [tickColor, annotations]
  );

  const responseRate = responses.length > 0 ? (validResponses / responses.length) * 100 : 0;
  const { question, description } = useGraphDescription('DiscussionFrequencyByRole');

  return (
    <SurveyChart
      question={question}
      description={description}
      numberOfResponses={validResponses}
      responseRate={responseRate}
      data={chartData}
      layout={layout}
      hasExploreData={false}
      showBackButton={showBackButton}
      showExploreTitle={true}
      onBack={onBack}
    />
  );
};
