import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions";

interface Props {
    className?: string;
}

const normalizeApplicationDomain = (value: string) =>
    value.replace(/\s+/g, " ").trim();

const DemographicApplicationDomain = ({ className }: Props) => {
    const questionHeader =
        columnDefinitions.find((c) => c.key === "primaryApplicationDomain")?.header
    const questionHeaderOther =
        columnDefinitions.find((c) => c.key === "primaryApplicationDomainOther")?.header
    const chartBarColor = useThemeColor("--color-plum-400");
    const titleColor = useThemeColor("--color-ink-900");
    const tickColor = useThemeColor("--color-ink-700");
    const surveyResponses = useSurveyData();
    const borderColor = useThemeColor("--color-ink-200");

    const applicationDomainStats = useMemo(() => {
        const counts = new Map<string, number>();

        surveyResponses.forEach((response) => {
            const primaryDomain = normalizeApplicationDomain(
                response.raw.primaryApplicationDomain ?? ""
            );

            const domain = primaryDomain;

            if (domain.length > 0 && domain.toLowerCase() !== "n/a") {
                counts.set(domain, (counts.get(domain) ?? 0) + 1);
            }
        });

        return Array.from(counts.entries())
            .map(([domain, count]) => ({ domain, count }))
            .sort((a, b) => b.count - a.count);

    }, [surveyResponses]);

    const otherApplicationDomainTexts = useMemo(() => {
        return surveyResponses
            .map((response) => normalizeApplicationDomain(response.raw.primaryApplicationDomainOther ?? ""))
            .filter((value) => value.length > 0);
    }, [surveyResponses]);

    const chartData = useMemo<Data[]>(() => {
        return [
            {
                x: applicationDomainStats.map((item) => item.count),
                y: applicationDomainStats.map((item) => item.domain),
                type: "bar",
                orientation: "h",
                marker: {
                    color: chartBarColor,
                },
                text: applicationDomainStats.map((item) => item.count.toString()),
                // --- ÄNDERUNG 1: Textposition auf "outside" gesetzt ---
                textposition: "outside",
                hoverinfo: "y+x",
                // --- ÄNDERUNG 2: Farbe für den Text ausserhalb definiert ---
                textfont: {
                    color: tickColor,
                }
            },
        ];
        // --- ÄNDERUNG 3: tickColor zur Dependency-Liste hinzugefügt ---
    }, [applicationDomainStats, chartBarColor, tickColor]);

    const layout = useMemo<Partial<Layout>>(
        () => ({
            // --- ÄNDERUNG 4: Rechter Rand vergrössert für den Text ---
            margin: { t: 40, r: 40, b: 40, l: 250 },
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            xaxis: {
                tickangle: 0,
                tickfont: {
                    family: "Inter, sans-serif",
                    size: 12,
                    color: tickColor,
                },
                zeroline: false,
            },
            yaxis: {
                autorange: "reversed",
                tickfont: {
                    family: "Inter, sans-serif",
                    size: 12,
                    color: tickColor,
                },
                showline: false,
                automargin: true,
            },
            showlegend: false,
        }),
        [titleColor, tickColor]
    );

    return (
        <>
        <div className={`w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className ?? ''}`}>
            <h3
                className="text-lg text-center"
                style={{ color: titleColor }}
            >
                {questionHeader}
            </h3>
            <div className="mt-4 h-[520px]">
            <Plot
                data={chartData}
                layout={layout}
                config={{ displayModeBar: false, responsive: true }}
                useResizeHandler
                style={{ width: "100%", height: "100%" }}
            />
            </div>
        </div>

        {otherApplicationDomainTexts.length > 0 && (
            <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3
                    className="text-lg text-center"
                    style={{ color: titleColor }}
                >
                    {questionHeaderOther}
                </h3>
                <div className="mt-4 h-[520px]">
                    <ul
                        className="h-[calc(100%-40px)] overflow-y-auto"
                        style={{ color: tickColor }}
                    >
                        {otherApplicationDomainTexts.map((text, index) => (
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
            </div>
        )}
    </>
    );
};

export default DemographicApplicationDomain;