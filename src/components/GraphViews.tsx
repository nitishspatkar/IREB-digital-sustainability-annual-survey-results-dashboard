// src/components/GraphViews.tsx
import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';
import GraphWrapper from './GraphWrapper'; // Importiert den Wrapper aus dem gleichen Ordner
import useThemeColor from '../hooks/useThemeColor'; // Pfad ggf. anpassen

// --- GEMEINSAME TYPEN ---
interface BaseProps {
  question: string;
  description?: string;
  numberOfResponses: number;
  responseRate: number;
  className?: string;
}

// --- VIEW 1: STANDARD DIAGRAMM (Chart View) ---
interface ChartProps extends BaseProps {
  data: Data[];
  layout: Partial<Layout>;
  hasExploreData: boolean;
  showBackButton?: boolean;
  showExploreTitle?: boolean;
  onExplore?: () => void;
  onBack?: () => void;
}

export const SurveyChart = ({
  question,
  description,
  numberOfResponses,
  responseRate,
  data,
  layout,
  hasExploreData,
  showBackButton,
  showExploreTitle,
  onExplore,
  className,
  onBack,
}: ChartProps) => {
  return (
    <div className={`space-y-6 ${className ?? ''}`}>
      {showExploreTitle && (
        <h1 className="text-2xl font-semibold tracking-tight text-ireb-berry font-pressura font-bold">
          Explore: {question}
        </h1>
      )}
      <GraphWrapper
        question={question}
        description={description}
        numberOfResponses={numberOfResponses}
        responseRate={responseRate}
        showExploreButton={hasExploreData}
        onExplore={onExplore}
        showBackButton={showBackButton}
        onBack={onBack}
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
    </div>
  );
};

// --- VIEW 2: DETAIL LISTE (Explore View) ---
interface ExploreListProps extends BaseProps {
  title: string; // Der Titel der Seite (meist die Hauptfrage)
  items: string[];
  onBack: () => void;
}

export const SurveyExploreList = ({
  title,
  items,
  question,
  description,
  numberOfResponses,
  responseRate,
  onBack,
  className,
}: ExploreListProps) => {
  const tickColor = useThemeColor('--color-ireb-grey-01');
  const borderColor = useThemeColor('--color-ireb-grey-01');

  return (
    <div className={`space-y-6 ${className ?? ''}`}>
      {/* 2. Page Title */}
      <h1 className="text-2xl font-semibold tracking-tight text-ireb-berry font-pressura font-bold">
        Explore: {title}
      </h1>

      {/* 3. Content Wrapper */}
      <GraphWrapper
        question={question}
        description={description}
        numberOfResponses={numberOfResponses}
        responseRate={responseRate}
        showExploreButton={false}
        showBackButton={true} // Neu
        onBack={onBack}
      >
        <div className="h-[520px] overflow-y-auto">
          <ul style={{ color: tickColor }}>
            {items.map((text, index) => (
              <li
                key={index}
                className="border-b px-2 py-3 text-sm"
                style={{ borderColor: borderColor }}
              >
                {text}
              </li>
            ))}
          </ul>
        </div>
      </GraphWrapper>
    </div>
  );
};

// --- VIEW 3: EXPLORE VIEW (Multiple Charts Page) ---
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

// --- VIEW 4: GENERIC CHART (Flexible Chart View) ---
import { useMemo } from 'react';
import { useSurveyData } from '../data/data-parsing-logic/SurveyContext';
import type { SurveyResponse } from '../data/data-parsing-logic/SurveyResponse';
import { useGraphDescription } from '../hooks/useGraphDescription';
import type { GraphId } from '../hooks/useGraphDescription';
import { useGraphExplore } from '../contexts/GraphExploreContext';

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
export type ChartProcessorResult = {
  traces: Data[]; // The ready-to-use Plotly data array
  stats: {
    numberOfResponses: number;
    totalEligible?: number; // Optional, defaults to total survey count
  };
};

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
}

export const GenericChart = ({
  graphId,
  processor,
  layout = {},
  onExplore,
  exploreComponents,
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
  const { traces, stats } = useMemo(
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
  if (activeExploreId !== null && activeExploreId !== graphId) {
    return null;
  }

  // Show explore view if this chart is being explored
  if (activeExploreId === graphId && exploreComponents) {
    return <ExploreView title={question} components={exploreComponents} onBack={handleBack} />;
  }

  return (
    <SurveyChart
      question={question}
      description={description}
      numberOfResponses={stats.numberOfResponses}
      responseRate={responseRate}
      data={traces}
      layout={finalLayout}
      hasExploreData={!!onExplore || (!!exploreComponents && exploreComponents.length > 0)}
      onExplore={handleExplore}
    />
  );
};
