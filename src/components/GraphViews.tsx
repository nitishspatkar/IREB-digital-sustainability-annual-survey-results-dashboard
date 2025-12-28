// src/components/GraphViews.tsx
import Plot from 'react-plotly.js';
import type { Data, Layout } from 'plotly.js';
import GraphWrapper from './GraphWrapper';
import useThemeColor from '../hooks/useThemeColor';

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
  onExplore?: () => void;
  // Comparison props
  availableYears?: readonly string[];
  compareYears?: string[];
  onToggleCompareYear?: (year: string) => void;
}

export const SurveyChart = ({
  question,
  description,
  numberOfResponses,
  responseRate,
  data,
  layout,
  hasExploreData,
  onExplore,
  className,
  availableYears,
  compareYears,
  onToggleCompareYear,
}: ChartProps) => {
  return (
    <div className={className}>
      <GraphWrapper
        question={question}
        description={description}
        numberOfResponses={numberOfResponses}
        responseRate={responseRate}
        showExploreButton={hasExploreData}
        onExplore={onExplore}
        availableYears={availableYears}
        compareYears={compareYears}
        onToggleCompareYear={onToggleCompareYear}
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
