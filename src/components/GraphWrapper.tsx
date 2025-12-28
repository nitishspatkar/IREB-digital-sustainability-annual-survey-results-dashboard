import type { ReactNode } from 'react';

interface GraphWrapperProps {
  question: string;
  description?: string;
  numberOfResponses?: number;
  responseRate?: number;
  children: ReactNode;
  onExplore?: () => void;
  showExploreButton?: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
  customComparisonToggle?: ReactNode; // New prop for custom toggle component
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
  customComparisonToggle, // Use new prop here
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

      {/* Action buttons */}
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

        {customComparisonToggle && (
          <div className="flex items-center gap-2 ml-auto">{customComparisonToggle}</div>
        )}
      </div>
    </div>
  );
};

export default GraphWrapper;
