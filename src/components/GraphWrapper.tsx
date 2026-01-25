import { forwardRef, type ReactNode } from 'react';
import { HelpTip } from './HelpTip';

interface GraphWrapperProps {
  question: string;
  graphId?: string;
  description?: string;
  numberOfResponses?: number;
  responseRate?: number;
  children: ReactNode;
  onExplore?: () => void;
  showExploreButton?: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
  showResponseStats?: boolean;
  // Comparison support
  compareYear?: string | null;
  onCompareYearChange?: (year: string | null) => void;
  availableCompareYears?: readonly string[];
}

const GraphWrapper = forwardRef<HTMLDivElement, GraphWrapperProps>(
  (
    {
      question,
      graphId,
      description,
      numberOfResponses,
      responseRate,
      children,
      onExplore,
      showExploreButton = false,
      onBack,
      showBackButton = false,
      showResponseStats = true,
      compareYear,
      onCompareYearChange,
      availableCompareYears = [],
    },
    ref
  ) => {
    const showNumberOfResponses = typeof numberOfResponses === 'number';
    const showResponseRate = typeof responseRate === 'number';
    const showStats = showNumberOfResponses || showResponseRate;

    // Use graphId for stable group name if available, otherwise fallback to sanitized question
    const radioGroupName = graphId
      ? `compare-${graphId}`
      : `compare-${question.replace(/[^a-zA-Z0-9-_]/g, '')}`;

    return (
      <div ref={ref} className="space-y-4">
        {/* Stats boxes */}
        {showStats && showResponseStats && (
          <div className="flex gap-4 font-mori">
            {showNumberOfResponses && (
              <div className="bg-ireb-light-berry px-6 py-3">
                <span className="text-base text-ireb-berry">
                  Number of responses: <span className="text-ireb-berry">{numberOfResponses}</span>
                </span>
              </div>
            )}
            {showResponseRate && (
              <div className="bg-ireb-light-berry px-6 py-3">
                <span className="text-base text-ireb-berry">
                  Response rate:{' '}
                  <span className="text-ireb-berry">{responseRate!.toFixed(2)}%</span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Main content box */}
        <div className="bg-white shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 xl:grid-cols-4">
            {/* Left side - Text content (1/4) */}
            <div className="col-span-1 space-y-3 bg-ireb-berry p-6 font-pressura">
              <h2 className="text-xl text-white">{question}</h2>
              {description && (
                <p className="text-sm text-white leading-relaxed font-mori">{description}</p>
              )}
            </div>

            {/* Right side - Graph (3/4) */}
            <div className="col-span-1 xl:col-span-3 p-6">{children}</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 items-center flex-wrap">
          <div className="font-mori font-bold flex items-center cursor-pointer justify-between rounded-none border-3 px-4 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ireb-light-berry/50 bg-ireb-berry text-white border-ireb-berry shadow-card">
            Results
          </div>
          {showExploreButton && (
            <HelpTip
              text="Click to drill down into details by Role, Age, or Experience."
              position="top"
            >
              <button
                onClick={onExplore}
                className="font-mori font-bold flex items-center cursor-pointer justify-between rounded-none border-3 px-4 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ireb-light-berry/50 bg-ireb-superlight-berry text-ireb-berry border-ireb-berry hover:bg-ireb-light-berry hover:text-ireb-berry"
              >
                Explore
              </button>
            </HelpTip>
          )}
          {showBackButton && (
            <button
              onClick={onBack}
              className="font-mori font-bold flex items-center cursor-pointer justify-between rounded-none border-3 px-4 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ireb-light-berry/50 bg-ireb-superlight-berry text-ireb-berry border-ireb-berry hover:bg-ireb-light-berry hover:text-ireb-berry"
            >
              <span className="pr-2">←</span> Back to Overview
            </button>
          )}

          {/* Comparison controls */}
          {availableCompareYears.length > 0 && onCompareYearChange && (
            <div className="ml-auto">
              <HelpTip
                text="Select a year to see how this data point changed over time."
                position="top"
                tooltipClassName="w-40"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mori font-bold text-ireb-berry">Compare:</span>
                  <label className="flex items-center gap-2 cursor-pointer font-mori">
                    <input
                      type="radio"
                      name={radioGroupName}
                      checked={compareYear === null}
                      onChange={() => onCompareYearChange(null)}
                      className="w-4 h-4 text-ireb-berry border-ireb-berry focus:ring-ireb-berry"
                      style={{ accentColor: 'var(--color-ireb-berry)' }}
                    />
                    <span className="text-ireb-berry">None</span>
                  </label>
                  {availableCompareYears.map((year) => (
                    <label key={year} className="flex items-center gap-2 cursor-pointer font-mori">
                      <input
                        type="radio"
                        name={radioGroupName}
                        checked={compareYear === year}
                        onChange={() => onCompareYearChange(year)}
                        className="w-4 h-4 text-ireb-berry border-ireb-berry focus:ring-ireb-berry"
                        style={{ accentColor: 'var(--color-ireb-berry)' }}
                      />
                      <span className="text-ireb-berry">{year}</span>
                    </label>
                  ))}
                </div>
              </HelpTip>
            </div>
          )}
        </div>
      </div>
    );
  }
);

GraphWrapper.displayName = 'GraphWrapper';

export default GraphWrapper;
