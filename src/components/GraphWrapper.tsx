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
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 shadow-sm">
          <span className="text-sm text-slate-600">
            Number of responses:{" "}
            <span className="font-semibold text-slate-900">
              {numberOfResponses}
            </span>
          </span>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 shadow-sm">
          <span className="text-sm text-slate-600">
            Response rate:{" "}
            <span className="font-semibold text-slate-900">
              {responseRate}%
            </span>
          </span>
        </div>
      </div>

      {/* Main content box */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-4">
          {/* Left side - Text content (1/4) */}
          <div className="col-span-1 space-y-3 bg-ireb-berry p-6">
            <h2 className="text-3xl font-semibold text-white">{question}</h2>
            <p className="text-sm text-white leading-relaxed">{description}</p>
          </div>

          {/* Right side - Graph (3/4) */}
          <div className="col-span-3 p-6">{children}</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
          Button 1
        </button>
        <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
          Button 2
        </button>
      </div>
    </div>
  );
};

export default GraphWrapper;
