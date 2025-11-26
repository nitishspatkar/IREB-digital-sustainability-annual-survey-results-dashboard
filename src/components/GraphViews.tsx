// src/components/GraphViews.tsx
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";
import GraphWrapper from "./GraphWrapper"; // Importiert den Wrapper aus dem gleichen Ordner
import useThemeColor from "../hooks/useThemeColor"; // Pfad ggf. anpassen

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
            >
                <div className="h-[520px]">
                    <Plot
                        data={data}
                        layout={layout}
                        config={{ displayModeBar: false, responsive: true }}
                        useResizeHandler
                        style={{ width: "100%", height: "100%" }}
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
    const tickColor = useThemeColor("--color-ink-700");
    const borderColor = useThemeColor("--color-ink-200");

    return (
        <div className={`space-y-6 ${className ?? ""}`}>
            {/* 1. Navigation Button (Style analog zu Explore Button) */}
            <div>
                <button
                    onClick={onBack}
                    className="cursor-pointer border border-ireb-berry bg-ireb-superlight-berry px-4 py-2 text-base font-medium text-ireb-berry transition-colors hover:brightness-75 w-fit flex items-center gap-2"
                >
                    <span>←</span> Back to Overview
                </button>
            </div>

            {/* 2. Page Title */}
            <h1 className="text-2xl font-semibold tracking-tight text-plum-500">
                Explore: {title}
            </h1>

            {/* 3. Content Wrapper */}
            <GraphWrapper
                question={question}
                description={description}
                numberOfResponses={numberOfResponses}
                responseRate={responseRate}
                showExploreButton={false}
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