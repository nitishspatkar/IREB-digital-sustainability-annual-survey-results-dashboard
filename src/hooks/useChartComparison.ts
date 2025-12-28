import { useState, useMemo } from 'react';
import type { Data, Layout } from 'plotly.js';
import { useYear } from '../data/data-parsing-logic/YearContext';
import { useSurveyData } from '../data/data-parsing-logic/SurveyContext';
import { SurveyRepository } from '../data/data-parsing-logic/SurveyRepository';
import type { SurveyResponse } from '../data/data-parsing-logic/SurveyResponse';

// Define a color palette for comparison years (Greys/Muted tones)
const COMPARISON_COLORS = ['#bdbcbc', '#878787', '#3c3c3b'];

interface UseChartComparisonProps<T> {
  /** Function to process raw responses into stats (T) */
  processData: (responses: readonly SurveyResponse[]) => T;
  /** Function to create a Plotly trace from stats */
  createTrace: (stats: T, year: string, color: string, isPrimary: boolean) => Data;
  /** Base layout to merge with */
  baseLayout?: Partial<Layout>;
  /** Primary color for the active year */
  primaryColor: string;
}

export interface ComparisonWrapperProps {
  availableYears: readonly string[];
  compareYears: string[];
  onToggleCompareYear: (year: string) => void;
}

export const useChartComparison = <T>({
  processData,
  createTrace,
  baseLayout,
  primaryColor,
}: UseChartComparisonProps<T>) => {
  const activeYear = useYear();
  const activeResponses = useSurveyData();

  // Get all available years from repository to populate checkboxes
  const allAvailableYears = useMemo(() => SurveyRepository.getAvailableYears(), []);

  // Filter out the active year from the options
  const availableComparisonYears = useMemo(
    () => allAvailableYears.filter((y) => y !== activeYear).sort((a, b) => Number(b) - Number(a)),
    [allAvailableYears, activeYear]
  );

  // State for selected comparison years
  const [compareYears, setCompareYears] = useState<string[]>([]);

  const onToggleCompareYear = (year: string) => {
    setCompareYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  // 1. Aggregate data for all relevant years (Active + Selected Comparison)
  // We map over [activeYear, ...compareYears] to preserve order: Active first
  const allData = useMemo(() => {
    const years = [activeYear, ...compareYears];
    return years.map((year) => {
      // Use context data for active year to avoid re-fetch, fetch others from repo
      const responses = year === activeYear ? activeResponses : SurveyRepository.getSurvey(year);
      return { year, responses };
    });
  }, [activeYear, activeResponses, compareYears]);

  // 2. Process data into stats using the provided callback
  const processedData = useMemo(() => {
    return allData.map(({ year, responses }) => ({
      year,
      stats: processData(responses),
    }));
  }, [allData, processData]);

  // 3. Generate Plotly traces
  const data = useMemo(() => {
    return processedData.map(({ year, stats }, index) => {
      const isPrimary = year === activeYear;
      // Cycle through comparison colors if multiple years selected
      const color = isPrimary
        ? primaryColor
        : COMPARISON_COLORS[(index - 1) % COMPARISON_COLORS.length];

      const trace = createTrace(stats, year, color, isPrimary);

      // Ensure legend visibility logic is consistent
      return {
        ...trace,
        name: year, // Force name to be the year
        showlegend: compareYears.length > 0, // Show legend only if comparing
      };
    });
  }, [processedData, activeYear, primaryColor, createTrace, compareYears.length]);

  // 4. Update layout for grouping
  const layout = useMemo(() => {
    const isComparing = compareYears.length > 0;
    return {
      ...baseLayout,
      barmode: isComparing ? 'group' : baseLayout?.barmode,
      legend: isComparing
        ? { orientation: 'h' as const, y: -0.2, x: 0.5, xanchor: 'center' as const }
        : { showlegend: false },
    } as Partial<Layout>;
  }, [baseLayout, compareYears.length]);

  // 5. Calculate stats for the *active* year
  const activeStats = processedData.find((d) => d.year === activeYear)?.stats;

  // Props to pass to GraphWrapper
  const wrapperProps: ComparisonWrapperProps = {
    availableYears: availableComparisonYears,
    compareYears,
    onToggleCompareYear,
  };

  return {
    data,
    layout,
    wrapperProps,
    activeStats,
  };
};
