import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';
import GraphWrapper from './GraphWrapper';
import useThemeColor from '../hooks/useThemeColor';
import { useMemo, useRef, useState } from 'react';
import { useSurveyData } from '../data/data-parsing-logic/SurveyContext';
import { useYear } from '../data/data-parsing-logic/YearContext';
import { SurveyRepository } from '../data/data-parsing-logic/SurveyRepository';
import type { SurveyResponse } from '../data/data-parsing-logic/SurveyResponse';
import { useGraphDescription } from '../hooks/useGraphDescription';
import type { GraphId } from '../hooks/useGraphDescription';
import { useGraphExplore } from '../contexts/GraphExploreContext';

export type ExploreComponent = React.ComponentType<{ onBack: () => void }>;

// 1. Define the Palette that will be passed to the processors, which then can use it to style their graphs
export type ChartPalette = {
  berry: string;
  lightBerry: string;
  superLightBerry: string;
  grey: string;
  grey02: string;
  spring: string;
  lightSpring: string;
  darkSpring: string;
  mandarin: string;
  transport: string;
  night: string;
};

// 2. Define what your logic function must return
//
// ChartProcessorResult is a discriminated union that enforces mutual exclusivity:
// - A processor returns EITHER traces (for Plotly charts) OR items (for text lists), never both.
// - TypeScript enforces this at compile time via the `never` type on the excluded property.
//
// traces: Data[] - Plotly.js trace objects for rendering interactive charts (bar, pie, line, etc.)
//         Used when the visualization requires a graph/chart.
//
// items: string[] - Plain text entries for rendering as a styled scrollable list.
//        Used for open-ended survey responses (e.g., "Describe your training").
//
// stats: Required metadata for the GraphWrapper header display:
//   - numberOfResponses: Count of valid data points (shown as "Number of responses: X")
//   - totalEligible: Optional denominator for response rate calculation.
//                    Defaults to total survey count if omitted.
//                    Example: If 50 people said "Yes" to Q10 (eligible), and 30 provided descriptions,
//                    totalEligible=50 yields a 60% response rate.

type ChartProcessorStats = {
  numberOfResponses: number;
  totalEligible?: number; // Optional, defaults to total survey count
};

// Chart mode: returns Plotly traces
type ChartModeResult = {
  traces: Data[];
  items?: never;
  stats: ChartProcessorStats;
};

// List mode: returns string items
type ListModeResult = {
  traces?: never;
  items: string[];
  stats: ChartProcessorStats;
};

export type ChartProcessorResult = ChartModeResult | ListModeResult;

// 3. The Processor Function Signature
export type ChartProcessor = (
  responses: readonly SurveyResponse[],
  palette: ChartPalette
) => ChartProcessorResult | null;

// 4. Comparison Support Types

// Data Extractor: Extracts normalized data from responses (chart-specific)
export type DataExtractor<T> = (responses: readonly SurveyResponse[]) => T;

// Comparison Strategy: Takes extracted data from two years and generates comparison visualization (reusable)
export type ComparisonStrategy<T> = (
  currentYearData: T,
  compareYearData: T,
  currentYear: string,
  compareYear: string,
  palette: ChartPalette
) => ChartProcessorResult | null;

interface GenericChartProps<T = never> {
  graphId: GraphId; // ID for text lookup
  processor: ChartProcessor; // The unique logic function
  layout?: Partial<Layout>; // Unique layout overrides
  onExplore?: () => void;
  exploreComponents?: ExploreComponent[]; // Optional array of explore components
  isEmbedded?: boolean;
  showResponseStats?: boolean;
  onBack?: () => void; // Optional back handler
  // Comparison support (optional)
  dataExtractor?: DataExtractor<T>;
  comparisonStrategy?: ComparisonStrategy<T>;
  enableInteractions?: boolean;
}

export const GenericChart = <T,>({
  graphId,
  processor,
  layout = {},
  onExplore,
  exploreComponents,
  isEmbedded = false,
  onBack,
  dataExtractor,
  showResponseStats = true,
  comparisonStrategy,
  enableInteractions = false,
}: GenericChartProps<T>) => {
  // --- A. Boilerplate Hooks ---
  const { activeExploreId, setActiveExploreId } = useGraphExplore();
  const responses = useSurveyData();
  const currentYear = useYear();
  const { question, description } = useGraphDescription(graphId);

  // --- Comparison State ---
  const [compareYear, setCompareYear] = useState<string | null>(null);
  const availableYears = useMemo(() => {
    return SurveyRepository.getAvailableYears().filter((year) => year !== currentYear);
  }, [currentYear]);

  // --- Scroll position tracking ---
  const graphRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);

  // --- B. Fetch Theme Colors once ---
  const palette = {
    berry: useThemeColor('--color-ireb-berry'),
    lightBerry: useThemeColor('--color-ireb-light-berry'),
    superLightBerry: useThemeColor('--color-ireb-superlight-berry'),
    grey: useThemeColor('--color-ireb-grey-01'),
    grey02: useThemeColor('--color-ireb-grey-02'),
    spring: useThemeColor('--color-ireb-spring'),
    lightSpring: useThemeColor('--color-ireb-light-spring'),
    darkSpring: useThemeColor('--color-ireb-dark-spring'),
    mandarin: useThemeColor('--color-ireb-mandarin'),
    transport: useThemeColor('--color-ireb-sky'),
    night: useThemeColor('--color-ireb-grey-01'),
  };

  // --- C. Execute the unique logic ---
  // Use comparison strategy if compare year is selected and both extractor and strategy are provided
  // We capture the whole result object (or null) instead of destructuring immediately
  const processorResult = useMemo(() => {
    if (compareYear && dataExtractor && comparisonStrategy) {
      // Comparison mode
      const compareResponses = SurveyRepository.getSurvey(compareYear);
      const currentYearData = dataExtractor(responses);
      const compareYearData = dataExtractor(compareResponses);
      return comparisonStrategy(
        currentYearData,
        compareYearData,
        currentYear,
        compareYear,
        palette
      );
    } else {
      // Normal mode
      return processor(responses, palette);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    responses,
    processor,
    compareYear,
    dataExtractor,
    comparisonStrategy,
    currentYear,
    palette.berry,
    palette.grey,
    palette.grey02,
    palette.spring,
    palette.lightSpring,
    palette.darkSpring,
    palette.mandarin,
    palette.lightBerry,
    palette.superLightBerry,
    palette.transport,
    palette.night,
  ]);

  // --- CHECK: If no data exists, do not render anything ---
  if (!processorResult) {
    return null;
  }

  // Now it is safe to destructure
  const { traces, items, stats } = processorResult;

  // --- D. Calculate Rates ---
  const denominator = stats.totalEligible ?? responses.length;
  const responseRate = denominator > 0 ? (stats.numberOfResponses / denominator) * 100 : 0;

  const handleExplore = () => {
    // Store current scroll position before exploring
    scrollPositionRef.current = window.scrollY;

    if (onExplore) {
      onExplore();
    } else if (exploreComponents && exploreComponents.length > 0) {
      setActiveExploreId(graphId);
      // Scroll to top of the graph
      setTimeout(() => {
        graphRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  const handleBack = () => {
    setActiveExploreId(null);
    // Restore scroll position after a brief delay to allow render
    setTimeout(() => {
      window.scrollTo({ top: scrollPositionRef.current, behavior: 'smooth' });
    }, 100);
  };

  // Hide this chart if another chart is being explored
  if (!isEmbedded && activeExploreId !== null && activeExploreId !== graphId) {
    return null;
  }

  // Show explore view if this chart is being explored
  if (activeExploreId === graphId && exploreComponents) {
    return (
      <div ref={graphRef} className="space-y-12">
        <h1 className="text-2xl font-semibold tracking-tight text-ireb-berry font-pressura font-bold">
          Explore: {question}
        </h1>
        {exploreComponents.map((Component, index) => (
          <Component key={index} onBack={handleBack} />
        ))}
      </div>
    );
  }

  // --- List Mode: Render a styled list instead of a chart ---
  if (items) {
    return (
      <div className="flex flex-col">
        {(import.meta.env.DEV || new URLSearchParams(window.location.search).get('debug')) && (
          <div className="mb-1 w-fit border border-yellow-400 bg-yellow-100 px-1 font-mono text-xs text-yellow-800 select-all">
            graphId="{graphId}"
          </div>
        )}
        <GraphWrapper
          ref={graphRef}
          question={question}
          description={description}
          numberOfResponses={stats.numberOfResponses}
          responseRate={responseRate}
          showResponseStats={showResponseStats}
          showBackButton={!!onBack}
          onBack={onBack}
          compareYear={compareYear}
          onCompareYearChange={dataExtractor && comparisonStrategy ? setCompareYear : undefined}
          availableCompareYears={dataExtractor && comparisonStrategy ? availableYears : []}
        >
          <div className="h-[520px]">
            <ul className="h-full overflow-y-auto" style={{ color: palette.grey }}>
              {items.map((item, index) => (
                <li
                  key={index}
                  className="border-b px-2 py-3 text-sm"
                  style={{ borderColor: palette.grey }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </GraphWrapper>
      </div>
    );
  }

  // --- Chart Mode: Render standard Plotly chart ---
  return (
    <div className="flex flex-col">
      {(import.meta.env.DEV || new URLSearchParams(window.location.search).get('debug')) && (
        <div className="mb-1 w-fit border border-yellow-400 bg-yellow-100 px-1 font-mono text-xs text-yellow-800 select-all">
          graphId="{graphId}"
        </div>
      )}
      <GraphWrapper
        ref={graphRef}
        question={question}
        description={description}
        numberOfResponses={stats.numberOfResponses}
        responseRate={responseRate}
        showResponseStats={showResponseStats}
        showExploreButton={!!onExplore || (!!exploreComponents && exploreComponents.length > 0)}
        onExplore={handleExplore}
        showBackButton={!!onBack}
        onBack={onBack}
        compareYear={compareYear}
        onCompareYearChange={dataExtractor && comparisonStrategy ? setCompareYear : undefined}
        availableCompareYears={dataExtractor && comparisonStrategy ? availableYears : []}
      >
        <div className="h-[520px]">
          <Plot
            data={traces as Data[]}
            layout={
              enableInteractions
                ? layout
                : {
                    ...layout,
                    dragmode: false,
                    xaxis: {
                      ...(layout?.xaxis || {}),
                      fixedrange: true,
                    },
                    yaxis: {
                      ...(layout?.yaxis || {}),
                      fixedrange: true,
                    },
                  }
            }
            config={
              enableInteractions
                ? { displayModeBar: false, responsive: true }
                : {
                    displayModeBar: false,
                    responsive: true,
                    scrollZoom: false,
                    doubleClick: false,
                  }
            }
            useResizeHandler
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </GraphWrapper>
    </div>
  );
};
