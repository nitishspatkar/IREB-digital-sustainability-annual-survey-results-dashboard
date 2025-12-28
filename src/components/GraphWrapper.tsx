import type { ReactNode } from 'react';

export interface GraphWrapperProps {
  question: string;
  description?: string;
  numberOfResponses?: number;
  responseRate?: number;
  children: ReactNode;
  onExplore?: () => void;
  showExploreButton?: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
  // --- Comparison Props ---
  availableYears?: readonly string[];
  compareYears?: string[];
  onToggleCompareYear?: (year: string) => void;
}

const GraphWrapper = ({
  question,
  description,
  numberOfResponses,
  responseRate,
  children,
  onExplore,
  showExploreButton = false,
  onBack,
  showBackButton = false,
  availableYears,
  compareYears,
  onToggleCompareYear,
}: GraphWrapperProps) => {
  const showNumberOfResponses = typeof numberOfResponses === 'number';
  const showResponseRate = typeof responseRate === 'number';
  const showStats = showNumberOfResponses || showResponseRate;

  return (
    <div className="space-y-4">
      {/* Stats boxes */}
      {showStats && (
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
                Response rate: <span className="text-ireb-berry">{responseRate!.toFixed(2)}%</span>
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

      {/* Action buttons & Comparison Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex gap-4">
          <button className="font-mori font-bold flex items-center cursor-pointer justify-between rounded-none border-3 px-4 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ireb-light-berry/50 bg-ireb-berry text-white border-ireb-berry shadow-card">
            Results
          </button>
          {showExploreButton && (
            <button
              onClick={onExplore}
              className="font-mori font-bold flex items-center cursor-pointer justify-between rounded-none border-3 px-4 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ireb-light-berry/50 bg-ireb-superlight-berry text-ireb-berry border-ireb-berry hover:bg-ireb-light-berry hover:text-ireb-berry"
            >
              Explore
            </button>
          )}
          {showBackButton && (
            <button
              onClick={onBack}
              className="font-mori font-bold flex items-center cursor-pointer justify-between rounded-none border-3 px-4 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ireb-light-berry/50 bg-ireb-superlight-berry text-ireb-berry border-ireb-berry hover:bg-ireb-light-berry hover:text-ireb-berry"
            >
              <span className="pr-2">←</span> Back to Overview
            </button>
          )}
        </div>

        {/* Comparison Checkboxes */}
        {availableYears && availableYears.length > 0 && onToggleCompareYear && (
          <div className="flex items-center gap-4 font-mori text-sm text-ireb-grey-01 bg-white px-4 py-3 border border-ireb-superlight-berry">
            <span className="font-bold text-ireb-berry">Compare:</span>
            {availableYears.map((year) => (
              <label
                key={year}
                className="flex items-center gap-2 cursor-pointer select-none hover:text-ireb-berry"
              >
                <input
                  type="checkbox"
                  checked={compareYears?.includes(year)}
                  onChange={() => onToggleCompareYear(year)}
                  className="accent-ireb-berry h-4 w-4 cursor-pointer"
                />
                {year}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphWrapper;
