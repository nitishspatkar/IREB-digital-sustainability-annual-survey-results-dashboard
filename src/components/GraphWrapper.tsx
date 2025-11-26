import type { ReactNode } from "react";

interface GraphWrapperProps {
    question: string;
    description?: string;
    numberOfResponses?: number;
    responseRate?: number;
    children: ReactNode;
    onExplore?: () => void;
    showExploreButton?: boolean;
}

const GraphWrapper = ({
                          question,
                          description,
                          numberOfResponses,
                          responseRate,
                          children,
                          onExplore,
                          showExploreButton = false,
                      }: GraphWrapperProps) => {
    const showNumberOfResponses = typeof numberOfResponses === "number";
    const showResponseRate = typeof responseRate === "number";
    const showStats = showNumberOfResponses || showResponseRate;

    return (
        <div className="space-y-4">
            {/* Stats boxes */}
            {showStats && (
                <div
                    className="flex gap-4"
                    style={{
                        fontFamily:
                            '"GT Pressura Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    }}
                >
                    {showNumberOfResponses && (
                        <div className="bg-ireb-light-berry px-6 py-3">
              <span className="text-base text-ireb-berry">
                Number of responses:{" "}
                  <span className="text-ireb-berry">{numberOfResponses}</span>
              </span>
                        </div>
                    )}
                    {showResponseRate && (
                        <div className="bg-ireb-light-berry px-6 py-3">
              <span className="text-base text-ireb-berry">
                Response rate:{" "}
                  <span className="text-ireb-berry">
                  {responseRate!.toFixed(2)}%
                </span>
              </span>
                        </div>
                    )}
                </div>
            )}

            {/* Main content box */}
            <div className="bg-white shadow-sm overflow-hidden">
                <div className="grid grid-cols-1 xl:grid-cols-4">
                    {/* Left side - Text content (1/4) */}
                    <div className="col-span-1 space-y-3 bg-ireb-berry p-6">
                        <h2 className="text-xl text-white">{question}</h2>
                        {description && (
                            <p className="text-sm text-white leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Right side - Graph (3/4) */}
                    <div className="col-span-1 xl:col-span-3 p-6">{children}</div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
                <button className="cursor-pointer border border-ireb-berry bg-ireb-berry px-4 py-2 text-base font-medium text-white transition-colors hover:brightness-75">
                    results
                </button>
                {showExploreButton && (
                    <button
                        onClick={onExplore}
                        className="cursor-pointer border border-ireb-berry bg-ireb-superlight-berry px-4 py-2 text-base font-medium text-ireb-berry transition-colors hover:brightness-75"
                    >
                        explore
                    </button>
                )}
            </div>
        </div>
    );
};

export default GraphWrapper;