import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";

const NoTrainingReasons = () => {
    const barColor = useThemeColor("--color-plum-400");
    const titleColor = useThemeColor("--color-ink-900");
    const tickColor = useThemeColor("--color-ink-700");

    const surveyResponses = useSurveyData();

    const counts = useMemo(() => {
        const normalize = (v: string) => v?.trim().toLowerCase() ?? "";

        let lackAwareness = 0;
        let lackUnderstanding = 0;
        let noDemand = 0;
        let limitedBudget = 0;
        let notPriority = 0;
        let notSure = 0;
        let other = 0;

        surveyResponses.forEach((response) => {
            const raw = response.raw;

            if (normalize(raw.orgNoTrainingLackAwareness) === "yes")
                lackAwareness += 1;
            if (normalize(raw.orgNoTrainingLackUnderstanding) === "yes")
                lackUnderstanding += 1;
            if (normalize(raw.orgNoTrainingNoDemand) === "yes") noDemand += 1;
            if (normalize(raw.orgNoTrainingLimitedBudget) === "yes")
                limitedBudget += 1;
            if (normalize(raw.orgNoTrainingNotPriority) === "yes") notPriority += 1;
            if (normalize(raw.orgNoTrainingNotSure) === "yes") notSure += 1;

            const otherVal = normalize(raw.orgNoTrainingOther);
            if (otherVal.length > 0 && otherVal !== "n/a") other += 1;
        });

        const items = [
            { label: "Lack of awareness", value: lackAwareness },
            { label: "Lack of understanding", value: lackUnderstanding },
            { label: "No demand from employees", value: noDemand },
            { label: "Limited budget/resources", value: limitedBudget },
            { label: "Not a priority", value: notPriority },
            { label: "Not sure", value: notSure },
            { label: "Other", value: other },
        ];

        // Sort ascending by value for horizontal chart
        items.sort((a, b) => a.value - b.value);

        return {
            labels: items.map((item) => item.label),
            values: items.map((item) => item.value),
        } as const;
    }, [surveyResponses]);

    const data = useMemo<Data[]>(
        () => [
            {
                // --- CONVERTED TO HORIZONTAL BAR ---
                type: "bar",
                orientation: "h",
                x: counts.values,
                y: counts.labels,
                marker: { color: barColor },
                // --- ADDED TEXT LABELS ---
                text: counts.values.map((v) => v.toString()),
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
        [counts, barColor, tickColor] // Added tickColor
    );

    const layout = useMemo<Partial<Layout>>(
        () => ({
            margin: { t: 50, r: 40, b: 40, l: 200 }, // Adjusted margins
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            title: {
                text: "Reasons why organizations don’t offer training/resources",
                font: { family: "Inter, sans-serif", size: 18, color: titleColor },
            },
            xaxis: { // Now the value axis
                title: {
                    text: "Number of Respondents",
                    font: { family: "Inter, sans-serif", size: 12, color: tickColor },
                },
                tickfont: { family: "Inter, sans-serif", size: 12, color: tickColor },
            },
            yaxis: { // Now the category axis
                tickfont: { family: "Inter, sans-serif", size: 12, color: tickColor },
            },
        }),
        [titleColor, tickColor]
    );

    return (
        <div className="h-[520px] w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <Plot
                data={data}
                layout={layout}
                config={{ displayModeBar: false, responsive: true }}
                useResizeHandler
                style={{ width: "100%", height: "100%" }}
            />
        </div>
    );
};

export default NoTrainingReasons;