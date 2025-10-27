import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";

type ReasonStat = {
    label: string;
    key: string;
    count: number;
};

// Define the keys and labels for Q16
const reasonsList: Omit<ReasonStat, "count">[] = [
    {
        label: "I was not aware such programs existed",
        key: "notMoreTrainingNotAware",
    },
    {
        label: "My organization does not offer such programs",
        key: "notMoreTrainingNoOrganization",
    },
    {
        label: "I have not had the opportunity to attend",
        key: "notMoreTrainingNoOpportunity",
    },
    {
        label: "I don't see the need for such training",
        key: "notMoreTrainingNoNeed",
    },
    {
        label: "The cost is too high",
        key: "notMoreTrainingTooExpensive",
    },
    {
        label: "Other",
        key: "notMoreTrainingOther",
    },
];

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

const TrainingReasonsNotMore = () => {
    const barColor = useThemeColor("--color-plum-400");
    const titleColor = useThemeColor("--color-ink-900");
    const tickColor = useThemeColor("--color-ink-700");

    const responses = useSurveyData();

    const stats = useMemo<ReasonStat[]>(() => {
        const counts = new Map<string, number>();
        reasonsList.forEach((r) => counts.set(r.key, 0));

        // 1. Filter for users who answered "Yes" to Q10
        const participants = responses.filter(
            (r) =>
                normalize(r.raw.participatedInTraining ?? "").toLowerCase() === "yes"
        );

        // 2. Count each reason for these users
        participants.forEach((r) => {
            reasonsList.forEach((reason) => {
                const rawValue = r.raw[reason.key as keyof typeof r.raw] ?? "";
                const normalized = normalize(rawValue);

                // Logic for multi-select checkboxes
                if (reason.key === "notMoreTrainingOther") {
                    // For 'Other', any text is a "yes"
                    if (normalized.length > 0) {
                        counts.set(reason.key, (counts.get(reason.key) ?? 0) + 1);
                    }
                } else {
                    // For standard checkboxes, "Yes" means selected
                    if (normalized.toLowerCase() === "yes") {
                        counts.set(reason.key, (counts.get(reason.key) ?? 0) + 1);
                    }
                }
            });
        });

        // 3. Format and sort (ascending, so highest bar is at the top)
        return reasonsList
            .map((reason) => ({
                ...reason,
                count: counts.get(reason.key) ?? 0,
            }))
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
            margin: { t: 60, r: 40, b: 60, l: 300 },
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            title: {
                text: "Reasons for Not Participating in More Training (Participants Only)",
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

export default TrainingReasonsNotMore;