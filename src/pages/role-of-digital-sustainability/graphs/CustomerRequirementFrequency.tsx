import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";

type FrequencyStat = {
    label: string;
    count: number;
};

// Define the logical order of answers
const frequencyOrder = [
    "For every project or solution",
    "For most projects or solutions",
    "For some projects or solutions",
    "Rarely, but it has happened",
    "Never",
];

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

const CustomerRequirementFrequency = () => {
    const barColor = useThemeColor("--color-plum-400");
    const titleColor = useThemeColor("--color-ink-900");
    const tickColor = useThemeColor("--color-ink-700");

    const responses = useSurveyData();

    const stats = useMemo<FrequencyStat[]>(() => {
        const counts = new Map<string, number>();
        frequencyOrder.forEach((label) => counts.set(label, 0));

        responses.forEach((r) => {
            // Key for Q26
            const raw = normalize(r.raw.customerRequirementFrequency ?? "");
            if (counts.has(raw)) {
                counts.set(raw, (counts.get(raw) ?? 0) + 1);
            }
        });

        // Create array and sort it based on the predefined logical order
        return Array.from(counts.entries())
            .map(([label, count]) => ({ label, count }))
            .sort(
                (a, b) =>
                    frequencyOrder.indexOf(a.label) - frequencyOrder.indexOf(b.label)
            );
    }, [responses]);

    const data = useMemo<Data[]>(
        () => [
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
        ],
        [stats, barColor, tickColor]
    );

    const layout = useMemo<Partial<Layout>>(
        () => ({
            margin: { t: 50, r: 40, b: 60, l: 250 }, // Wide left margin for labels
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            title: {
                text: "Sustainability as an Explicit Customer Requirement",
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
                    data={data}
                    layout={layout}
                    config={{ displayModeBar: false, responsive: true }}
                    useResizeHandler
                    style={{ width: "100%", height: "100%" }}
                />
            )}
        </div>
    );
};

export default CustomerRequirementFrequency;