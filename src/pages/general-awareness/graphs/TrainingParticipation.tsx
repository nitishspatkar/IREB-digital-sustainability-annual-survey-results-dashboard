import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions";

type ParticipationStat = {
    label: string;
    count: number;
};

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

const TrainingParticipation = () => {
    const questionHeader =
        columnDefinitions.find((c) => c.key === "participatedInTraining")?.header
    const barColor = useThemeColor("--color-plum-400");
    const titleColor = useThemeColor("--color-ink-900");
    const tickColor = useThemeColor("--color-ink-700");

    const responses = useSurveyData();

    const stats = useMemo<ParticipationStat[]>(() => {
        const counts = new Map<string, number>();
        counts.set("Yes", 0);
        counts.set("No", 0);

        responses.forEach((r) => {
            // Data key for Q10
            const raw = normalize(r.raw.participatedInTraining ?? "");
            const lower = raw.toLowerCase();

            if (lower === "yes") {
                counts.set("Yes", (counts.get("Yes") ?? 0) + 1);
            } else if (lower === "no") {
                counts.set("No", (counts.get("No") ?? 0) + 1);
            }
            // Other values (empty, "n/a", etc.) are ignored
        });

        // Return in a fixed order for the bar chart
        return [
            { label: "Yes", count: counts.get("Yes") ?? 0 },
            { label: "No", count: counts.get("No") ?? 0 },
        ];
    }, [responses]);

    const chartData = useMemo<Data[]>(() => {
        return [
            {
                x: stats.map((s) => s.label),
                y: stats.map((s) => s.count),
                type: "bar",
                marker: {
                    color: barColor,
                },
                // Add text labels on top of bars
                text: stats.map((s) => s.count.toString()),
                textposition: "outside",
                textfont: {
                    family: "Inter, sans-serif",
                    size: 12,
                    color: tickColor,
                },
                cliponaxis: false,
                hoverinfo: "none",
            },
        ];
    }, [stats, barColor, tickColor]);

    const layout = useMemo<Partial<Layout>>(
        () => ({
            margin: { t: 60, r: 20, b: 60, l: 48 }, // Increased top margin for labels
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            xaxis: {
                tickfont: {
                    family: "Inter, sans-serif",
                    size: 12,
                    color: tickColor,
                },
            },
            yaxis: {
                title: {
                    text: "Number of Respondents",
                    font: {
                        family: "Inter, sans-serif",
                        size: 12,
                        color: tickColor,
                    },
                },
                tickfont: {
                    family: "Inter, sans-serif",
                    size: 12,
                    color: tickColor,
                },
            },
        }),
        [titleColor, tickColor]
    );

    const total = stats.reduce((a, b) => a + b.count, 0);

    return (
        <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3
                className="text-lg text-center"
                style={{ color: titleColor }}
            >
                {questionHeader}
            </h3>
            {total === 0 ? (
                <div className="mt-4 h-[520px]">
                    No data available
                </div>
            ) : (
                <div className="mt-4 h-[520px]">
                <Plot
                    data={chartData}
                    layout={layout}
                    config={{ displayModeBar: false, responsive: true }}
                    useResizeHandler
                    style={{ width: "100%", height: "100%" }}
                />
                </div>
            )}
        </div>
    );
};

export default TrainingParticipation;