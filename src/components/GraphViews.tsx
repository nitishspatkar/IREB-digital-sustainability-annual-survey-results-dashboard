import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';
import GraphWrapper from './GraphWrapper';
import useThemeColor from '../hooks/useThemeColor';
import { useMemo } from 'react';
import { useSurveyData } from '../data/data-parsing-logic/SurveyContext';
import type { SurveyResponse } from '../data/data-parsing-logic/SurveyResponse';
import { useGraphDescription } from '../hooks/useGraphDescription';
import type { GraphId } from '../hooks/useGraphDescription';
import { useGraphExplore } from '../contexts/GraphExploreContext';

export type ExploreComponent = React.ComponentType<{ onBack: () => void }>;

interface ExploreViewProps {
  title: string;
  components: ExploreComponent[];
  onBack: () => void;
}

export const ExploreView = ({ title, components, onBack }: ExploreViewProps) => {
  return (
    <div className="space-y-12">
      <h1 className="text-2xl font-semibold tracking-tight text-ireb-berry font-pressura font-bold">
        Explore: {title}
      </h1>
      {components.map((Component, index) => (
        <Component key={index} onBack={onBack} />
      ))}
    </div>
  );
};

// 1. Define the Palette that will be passed to your logic
export type ChartPalette = {
  berry: string;
  lightBerry: string;
  superLightBerry: string;
  grey: string;
  grey02: string;
  spring: string;
  darkSpring: string;
  mandarin: string;
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
) => ChartProcessorResult;

interface GenericChartProps {
  graphId: GraphId; // ID for text lookup
  processor: ChartProcessor; // The unique logic function
  layout?: Partial<Layout>; // Unique layout overrides
  onExplore?: () => void;
  exploreComponents?: ExploreComponent[]; // Optional array of explore components
  isEmbedded?: boolean;
  onBack?: () => void; // Optional back handler
}

export const GenericChart = ({
  graphId,
  processor,
  layout = {},
  onExplore,
  exploreComponents,
  isEmbedded = false,
  onBack,
}: GenericChartProps) => {
  // --- A. Boilerplate Hooks ---
  const { activeExploreId, setActiveExploreId } = useGraphExplore();
  const responses = useSurveyData();
  const { question, description } = useGraphDescription(graphId);

  // --- B. Fetch Theme Colors once ---
  const palette: ChartPalette = {
    berry: useThemeColor('--color-ireb-berry'),
    lightBerry: useThemeColor('--color-ireb-light-berry'),
    superLightBerry: useThemeColor('--color-ireb-superlight-berry'),
    grey: useThemeColor('--color-ireb-grey-01'),
    grey02: useThemeColor('--color-ireb-grey-02'),
    spring: useThemeColor('--color-ireb-spring'),
    darkSpring: useThemeColor('--color-ireb-dark-spring'),
    mandarin: useThemeColor('--color-ireb-mandarin'),
  };

  // --- C. Execute the unique logic ---
  const { traces, items, stats } = useMemo(
    () => processor(responses, palette),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      responses,
      processor,
      palette.berry,
      palette.grey,
      palette.grey02,
      palette.spring,
      palette.darkSpring,
      palette.mandarin,
      palette.lightBerry,
      palette.superLightBerry,
    ]
  );

  // --- D. Calculate Rates ---
  const denominator = stats.totalEligible ?? responses.length;
  const responseRate = denominator > 0 ? (stats.numberOfResponses / denominator) * 100 : 0;

  // --- E. Merge Layouts ---
  const defaultLayout: Partial<Layout> = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'PP Mori, sans-serif', color: palette.grey },
    xaxis: {
      tickfont: { family: 'PP Mori, sans-serif', size: 12, color: palette.grey },
      title: { font: { family: 'PP Mori, sans-serif', size: 12, color: palette.grey } },
    },
    yaxis: {
      tickfont: { family: 'PP Mori, sans-serif', size: 12, color: palette.grey },
      title: { font: { family: 'PP Mori, sans-serif', size: 12, color: palette.grey } },
    },
  };

  // Deep merge for nested layout properties
  const finalLayout: Partial<Layout> = {
    ...defaultLayout,
    ...layout,
    xaxis: { ...defaultLayout.xaxis, ...layout.xaxis },
    yaxis: { ...defaultLayout.yaxis, ...layout.yaxis },
  };

  const handleExplore = () => {
    if (onExplore) {
      onExplore();
    } else if (exploreComponents && exploreComponents.length > 0) {
      setActiveExploreId(graphId);
    }
  };

  const handleBack = () => {
    setActiveExploreId(null);
  };

  // Hide this chart if another chart is being explored
  if (!isEmbedded && activeExploreId !== null && activeExploreId !== graphId) {
    return null;
  }

  // Show explore view if this chart is being explored
  if (activeExploreId === graphId && exploreComponents) {
    return <ExploreView title={question} components={exploreComponents} onBack={handleBack} />;
  }

  // --- List Mode: Render a styled list instead of a chart ---
  if (items) {
    return (
      <GraphWrapper
        question={question}
        description={description}
        numberOfResponses={stats.numberOfResponses}
        responseRate={responseRate}
        showBackButton={!!onBack}
        onBack={onBack}
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
    );
  }

  // --- Chart Mode: Render standard Plotly chart ---
  return (
    <GraphWrapper
      question={question}
      description={description}
      numberOfResponses={stats.numberOfResponses}
      responseRate={responseRate}
      showExploreButton={!!onExplore || (!!exploreComponents && exploreComponents.length > 0)}
      onExplore={handleExplore}
      showBackButton={!!onBack}
      onBack={onBack}
    >
      <div className="h-[520px]">
        <Plot
          data={traces as Data[]}
          layout={finalLayout}
          config={{ displayModeBar: false, responsive: true }}
          useResizeHandler
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </GraphWrapper>
  );
};
