import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions";

type SatisfactionStat = {
    label: string;
    count: number;
};

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

const TrainingSatisfaction = () => {
    const questionHeader =
        columnDefinitions.find((c) => c.key === "trainingSatisfaction")?.header
    const barColor = useThemeColor("--color-plum-400");
    const titleColor = useThemeColor("--color-ink-900");
    const tickColor = useThemeColor("--color-ink-700");

    const responses = useSurveyData();

    const stats = useMemo<SatisfactionStat[]>(() => {
        const counts = new Map<string, number>();

        const participants = responses.filter(
            (r) =>
                normalize(r.raw.participatedInTraining ?? "").toLowerCase() === "yes"
        );

        participants.forEach((r) => {
            const raw = normalize(r.raw.trainingSatisfaction ?? "");
            if (!raw || raw.toLowerCase() === "n/a") return;

            let key = raw;
            const lower = raw.toLowerCase();
            if (lower === "yes") key = "Yes";
            else if (lower === "no") key = "No";

            counts.set(key, (counts.get(key) ?? 0) + 1);
        });

        const order = ["Yes", "No"];
        const items = Array.from(counts.entries()).map(([label, count]) => ({
            label,
            count,
        }));

        order.forEach((label) => {
            if (!counts.has(label)) items.push({ label, count: 0 });
        });

        return items.sort(
            (a, b) => order.indexOf(a.label) - order.indexOf(b.label)
        );
    }, [responses]);

    const chartData = useMemo<Data[]>(() => {
        return [
            {
                x: stats.map((s) => s.label),
                y: stats.map((s) => s.count),
                type: "bar",
                marker: { color: barColor },
                // --- CHANGES START HERE ---
                text: stats.map((s) => s.count.toString()),
                textposition: "outside",
                textfont: {
                    family: "Inter, sans-serif",
                    size: 12,
                    color: tickColor,
                },
                cliponaxis: false,
                // --- CHANGES END HERE ---
                hoverinfo: "none",
            },
        ];
    }, [stats, barColor, tickColor]); // Added tickColor

    const layout = useMemo<Partial<Layout>>(
        () => ({
            margin: { t: 50, r: 0, b: 60, l: 40 }, // Changed t: 30 to t: 50
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            xaxis: {
                tickfont: { family: "Inter, sans-serif", size: 12, color: tickColor },
            },
            yaxis: {
                title: {
                    text: "Number of Respondents",
                    font: { family: "Inter, sans-serif", size: 12, color: tickColor },
                },
                tickfont: { family: "Inter, sans-serif", size: 12, color: tickColor },
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

export default TrainingSatisfaction;