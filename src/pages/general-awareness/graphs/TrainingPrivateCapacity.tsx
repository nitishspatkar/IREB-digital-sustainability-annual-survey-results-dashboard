import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";

type CapacityStat = {
    label: string;
    count: number;
};

// Define the categories and their search terms
const capacityOptions = [
    {
        label: "Yes",
        searchTerms: ["yes"],
    },
    {
        label: "No",
        searchTerms: ["no"],
    },
    {
        label: "Both (Organization & Private)",
        searchTerms: [
            "my organization paid it on some occasions, and i paid it myself on others.",
            "my organization paid it", // Shorter fallback
        ],
    },
];

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

const TrainingPrivateCapacity = () => {
    const barColor = useThemeColor("--color-plum-400");
    const titleColor = useThemeColor("--color-ink-900");
    const tickColor = useThemeColor("--color-ink-700");

    const responses = useSurveyData();

    const stats = useMemo<CapacityStat[]>(() => {
        const counts = new Map<string, number>();
        capacityOptions.forEach((opt) => counts.set(opt.label, 0));

        // 1. Filter for users who answered "Yes" to Q10
        const participants = responses.filter(
            (r) =>
                normalize(r.raw.participatedInTraining ?? "").toLowerCase() === "yes"
        );

        // 2. Count responses for Q13
        participants.forEach((r) => {
            const raw = normalize(r.raw.trainingPrivateCapacity ?? "").toLowerCase();
            if (!raw || raw === "n/a") return;

            // Find which category this response matches
            const matchedOption = capacityOptions.find((opt) =>
                opt.searchTerms.some((term) => raw.startsWith(term))
            );

            if (matchedOption) {
                counts.set(
                    matchedOption.label,
                    (counts.get(matchedOption.label) ?? 0) + 1
                );
            }
        });

        // 3. Format and sort (ascending for horizontal bar)
        return Array.from(counts.entries())
            .map(([label, count]) => ({ label, count }))
            .sort((a, b) => a.count - b.count);
    }, [responses]);

    const chartData = useMemo<Data[]>(() => {
        return [
            {
                type: "bar",
                orientation: "h",
                x: stats.map((s) => s.count),
                y: stats.map((s) => s.label),
                marker: { color: barColor },
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
            margin: { t: 60, r: 40, b: 60, l: 200 }, // Left margin for labels
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            title: {
                text: "Training Funding Source (Participants Only)",
                font: { family: "Inter, sans-serif", size: 18, color: titleColor },
            },
            xaxis: {
                title: {
                    text: "Number of Respondents",
                    font: { family: "Inter, sans-serif", size: 12, color: tickColor },
                },
                tickfont: { family: "Inter, sans-serif", size: 12, color: tickColor },
            },
            yaxis: {
                tickfont: { family: "Inter, sans-serif", size: 12, color: tickColor },
            },
        }),
        [titleColor, tickColor]
    );

    const total = stats.reduce((a, b) => a + b.count, 0);

    return (
        <div className="h-[520px] w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            {total === 0 ? (
                <div className="flex h-full items-center justify-center text-ink-700">
                    No data available
                </div>
            ) : (
                <Plot
                    data={chartData}
                    layout={layout}
                    config={{ displayModeBar: false, responsive: true }}
                    useResizeHandler
                    style={{ width: "100%", height: "100%" }}
                />
            )}
        </div>
    );
};

export default TrainingPrivateCapacity;