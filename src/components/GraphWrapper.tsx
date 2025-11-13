import type { ReactNode } from "react";

interface GraphWrapperProps {
  question: string;
  description: string;
  numberOfResponses?: number;
  responseRate?: number;
  children: ReactNode;
}

const GraphWrapper = ({
  question,
  description,
  numberOfResponses = 0,
  responseRate = 0,
  children,
}: GraphWrapperProps) => {
  return (
    <div className="space-y-4">
      {/* Stats boxes */}
      <div className="flex gap-4">
        <div className="border border-slate-200 bg-ireb-light-berry px-6 py-3 shadow-sm">
          <span className="text-base text-ireb-berry">
            Number of responses:{" "}
            <span className="font-semibold text-ireb-berry">
              {numberOfResponses}
            </span>
          </span>
        </div>
        <div className="border border-slate-200 bg-ireb-light-berry px-6 py-3 shadow-sm">
          <span className="text-base text-ireb-berry">
            Response rate:{" "}
            <span className="font-semibold text-ireb-berry">
              {responseRate}%
            </span>
          </span>
        </div>
      </div>

      {/* Main content box */}
      <div className="border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 xl:grid-cols-4">
          {/* Left side - Text content (1/4) */}
          <div className="col-span-1 space-y-3 bg-ireb-berry p-6">
            <h2 className="text-3xl font-semibold text-white">{question}</h2>
            <p className="text-sm text-white leading-relaxed">{description}</p>
          </div>

          {/* Right side - Graph (3/4) */}
          <div className="col-span-1 xl:col-span-3 p-6">{children}</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <button className="cursor-pointer border border-ireb-berry bg-ireb-berry px-4 py-2 text-base font-medium text-white shadow-sm transition-colors hover:brightness-75">
          results
        </button>
        <button className="cursor-pointer border border-ireb-berry bg-ireb-superlight-berry px-4 py-2 text-base font-medium text-ireb-berry shadow-sm transition-colors hover:brightness-75">
          explore
        </button>
      </div>
    </div>
  );
};

export default GraphWrapper;
