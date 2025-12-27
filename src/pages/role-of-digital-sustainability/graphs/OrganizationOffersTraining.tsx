import { useMemo } from 'react';
import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';

import { useSurveyData } from '../../../data/SurveyContext';
import useThemeColor from '../../../hooks/useThemeColor';
import { columnDefinitions } from '../../../data/SurveyColumnDefinitions.ts';
import GraphWrapper from '../../../components/GraphWrapper';

const OrganizationOffersTraining = () => {
  const questionHeader = columnDefinitions.find(
    (c) => c.key === 'organizationOffersTraining'
  )?.header;
  const yesColor = useThemeColor('--color-ireb-spring');
  const noColor = useThemeColor('--color-ireb-mandarin');
  const barColor = useThemeColor('--color-ireb-grey-02');
  const tickColor = useThemeColor('--color-ireb-grey-01');

  const responses = useSurveyData();

  const counts = useMemo(() => {
    const norm = (v: string) => (v ?? '').trim().toLowerCase();

    let yes = 0;
    let no = 0;
    let notSure = 0;
    let unknown = 0;

    responses.forEach((r) => {
      const v = norm(r.raw.organizationOffersTraining as unknown as string);
      if (v === 'yes') yes += 1;
      else if (v === 'no') no += 1;
      else if (v === 'not sure') notSure += 1;
      else if (v === '') {
        return;
      } else if (v !== 'n/a') {
        unknown += 1;
      }
    });

    const labels: string[] = ['Yes', 'No', 'Not sure'];
    const values: number[] = [yes, no, notSure];
    if (unknown > 0) {
      labels.push('Unknown');
      values.push(unknown);
    }
    return { labels, values } as const;
  }, [responses]);

  const data = useMemo<Data[]>(
    () => [
      {
        x: counts.labels,
        y: counts.values,
        type: 'bar',
        marker: {
          color: counts.labels.map((label) => {
            if (label === 'Yes') {
              return yesColor;
            } else if (label === 'No') {
              return noColor;
            } else {
              return barColor;
            }
          }),
        },
        // --- ADDED TEXT LABELS ---
        text: counts.values.map((v) => v.toString()),
        textposition: 'outside',
        textfont: {
          family: 'PP Mori, sans-serif',
          size: 12,
          color: tickColor,
        },
        cliponaxis: false,
        hoverinfo: 'none',
      },
    ],
    [counts, barColor, yesColor, noColor, tickColor] // Added tickColor
  );

  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 50, r: 0, b: 60, l: 48 }, // Adjusted margins
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      xaxis: {
        // --- REMOVED tickangle ---
        tickfont: { family: 'PP Mori, sans-serif', size: 12, color: tickColor },
      },
      yaxis: {
        title: {
          text: 'Number of respondents',
          font: { family: 'PP Mori, sans-serif', size: 12, color: tickColor },
        },
        tickfont: { family: 'PP Mori, sans-serif', size: 12, color: tickColor },
      },
    }),
    [tickColor]
  );

  const total = counts.values.reduce((a, b) => a + b, 0);
  const responseRate = responses.length > 0 ? (total / responses.length) * 100 : 0;

  const question =
    questionHeader ?? 'Does your organization offer training on sustainable digital solutions?';
  const description =
    'Shows whether organizations offer training or resources on sustainable digital solutions.';

  return (
    <GraphWrapper
      question={question}
      description={description}
      numberOfResponses={total}
      responseRate={responseRate}
    >
      <div className="h-[520px]">
        <Plot
          data={data}
          layout={layout}
          config={{ displayModeBar: false, responsive: true }}
          useResizeHandler
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </GraphWrapper>
  );
};

export default OrganizationOffersTraining;
