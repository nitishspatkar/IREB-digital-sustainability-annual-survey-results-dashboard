import { useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';

import { SurveyRepository } from '../../../data/data-parsing-logic/SurveyRepository';
import { useYear } from '../../../data/data-parsing-logic/YearContext';
import useThemeColor from '../../../hooks/useThemeColor';
import GraphWrapper from '../../../components/GraphWrapper';
import { useGraphDescription } from '../../../hooks/useGraphDescription';
import ComparisonToggle from '../../../components/ComparisonToggle';

const normalizeAgeGroup = (value: string) => value.replace(/\s+/g, ' ').trim();

const ageGroupComparator = (a: string, b: string) => {
  const aMatch = a.match(/^(\d+)/);
  const bMatch = b.match(/^(\d+)/);

  if (aMatch && bMatch) {
    return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
  }
  return a.localeCompare(b);
};

const DemographicAgeGroup = () => {
  const colorLatest = useThemeColor('--color-ireb-berry');
  const colorPrevious = useThemeColor('--color-ireb-light-berry');
  const tickColor = useThemeColor('--color-ireb-grey-01');

  const { question, description } = useGraphDescription('DemographicAgeGroup');

  const activeYear = useYear();
  const [comparisonYear, setComparisonYear] = useState<string | null>(null);

  const allAvailableYears = useMemo(() => SurveyRepository.getAvailableYears(), []);
  const otherYears = useMemo(
    () => allAvailableYears.filter((year) => year !== activeYear),
    [allAvailableYears, activeYear]
  );

  // Calculate statistics (Number of Responses, Response Rate) always for the active year
  const { displayNumberOfResponses, displayResponseRate } = useMemo(() => {
    const activeYearResponses = SurveyRepository.getSurvey(activeYear);
    let responsesWithValidAgeGroups = 0;

    activeYearResponses.forEach((response) => {
      const ageGroup = normalizeAgeGroup(response.raw.ageGroup ?? '');
      if (ageGroup.length > 0 && ageGroup.toLowerCase() !== 'n/a') {
        responsesWithValidAgeGroups++;
      }
    });

    return {
      displayNumberOfResponses: responsesWithValidAgeGroups,
      displayResponseRate:
        activeYearResponses.length > 0
          ? (responsesWithValidAgeGroups / activeYearResponses.length) * 100
          : 0,
    };
  }, [activeYear]);

  const { chartData } = useMemo(() => {
    // If comparisonYear is selected, show [activeYear, comparisonYear] (sorted), otherwise just [activeYear]
    const yearsToDisplay = [activeYear];
    if (comparisonYear) {
      yearsToDisplay.push(comparisonYear);
      yearsToDisplay.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    }

    const allGroups = new Set<string>();
    const yearData = new Map<string, Map<string, number>>();

    yearsToDisplay.forEach((year) => {
      const responses = SurveyRepository.getSurvey(year);
      const counts = new Map<string, number>();

      responses.forEach((response) => {
        const ageGroup = normalizeAgeGroup(response.raw.ageGroup ?? '');
        if (ageGroup.length > 0 && ageGroup.toLowerCase() !== 'n/a') {
          counts.set(ageGroup, (counts.get(ageGroup) ?? 0) + 1);
          allGroups.add(ageGroup);
        }
      });
      yearData.set(year, counts);
    });

    const sortedGroups = Array.from(allGroups).sort(ageGroupComparator);

    const data: Data[] = yearsToDisplay.map((year) => {
      const counts = yearData.get(year);
      const isActiveYear = year === activeYear;

      return {
        x: sortedGroups,
        y: sortedGroups.map((group) => counts?.get(group) ?? 0),
        name: year,
        type: 'bar',
        marker: {
          // Active year gets the 'latest' (berry) color, comparison year gets 'previous' (light berry)
          color: isActiveYear ? colorLatest : colorPrevious,
        },
        text: sortedGroups.map((group) => (counts?.get(group) ?? 0).toString()),
        textposition: 'outside',
        textfont: {
          family: 'PP Mori, sans-serif',
          size: 12,
          color: tickColor,
        },
        cliponaxis: false,
        hoverinfo: 'name+y',
      } as unknown as Data;
    });

    return {
      chartData: data,
    };
  }, [comparisonYear, activeYear, colorLatest, colorPrevious, tickColor]);

  const layout = useMemo<Partial<Layout>>(
    () => ({
      margin: { t: 50, r: 0, b: 60, l: 40 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      barmode: comparisonYear ? 'group' : 'relative',
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
      legend: comparisonYear
        ? {
            orientation: 'h',
            y: 1.1,
            x: 0.5,
            xanchor: 'center',
            font: {
              family: 'PP Mori, sans-serif',
              size: 12,
              color: tickColor,
            },
          }
        : undefined,
    }),
    [tickColor, comparisonYear]
  );

  return (
    <GraphWrapper
      question={question}
      description={description}
      numberOfResponses={displayNumberOfResponses}
      responseRate={displayResponseRate}
      customComparisonToggle={
        otherYears.length > 0 ? (
          <ComparisonToggle
            yearsToCompare={otherYears}
            selectedComparisonYear={comparisonYear}
            onSelectComparisonYear={setComparisonYear}
          />
        ) : undefined
      }
    >
      <div className="h-[520px]">
        <Plot
          data={chartData}
          layout={layout}
          config={{ displayModeBar: false, responsive: true }}
          useResizeHandler
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </GraphWrapper>
  );
};

export default DemographicAgeGroup;
