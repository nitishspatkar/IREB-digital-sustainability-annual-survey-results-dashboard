import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";

const HindrancesToIncorporateSustainability = () => {
    const barColor = useThemeColor("--color-plum-400");
    const titleColor = useThemeColor("--color-ink-900");
    const tickColor = useThemeColor("--color-ink-700");

    const responses = useSurveyData();

    const counts = useMemo(() => {
        const norm = (v: string) => v?.trim().toLowerCase() ?? "";

        let lackInterest = 0;
        let lackKnowledge = 0;
        let limitedResources = 0;
        let financialConstraints = 0;
        let insufficientTime = 0;
        let lackSupport = 0;
        let complexity = 0;
        let culturalBarriers = 0;
        let stakeholderResistance = 0;
        let other = 0;

        // --- Precondition: Q28 = No ---
        const filteredResponses = responses.filter(
            (r) => norm(r.raw.personIncorporatesSustainability) === "no"
        );

        filteredResponses.forEach((r) => {
            const raw = r.raw;
            if (norm(raw.hindranceLackInterest) === "yes") lackInterest += 1;
            if (norm(raw.hindranceLackKnowledge) === "yes") lackKnowledge += 1;
            if (norm(raw.hindranceLimitedResources) === "yes") limitedResources += 1;
            if (norm(raw.hindranceFinancialConstraints) === "yes")
                financialConstraints += 1;
            if (norm(raw.hindranceInsufficientTime) === "yes") insufficientTime += 1;
            if (norm(raw.hindranceLackSupport) === "yes") lackSupport += 1;
            if (norm(raw.hindranceComplexity) === "yes") complexity += 1;
            if (norm(raw.hindranceCulturalBarriers) === "yes") culturalBarriers += 1;
            if (norm(raw.hindranceStakeholderResistance) === "yes")
                stakeholderResistance += 1;

            const otherVal = norm(raw.hindranceOther);
            if (otherVal === "yes" || (otherVal.length > 0 && otherVal !== "n/a"))
                other += 1;
        });

        const items = [
            { label: "Lack of personal interest", value: lackInterest },
            { label: "Lack of knowledge or awareness", value: lackKnowledge },
            { label: "Limited resources or budget", value: limitedResources },
            { label: "Financial constraints", value: financialConstraints },
            { label: "Insufficient time or competing priorities", value: insufficientTime },
            { label: "Lack of organizational or leadership support", value: lackSupport },
            { label: "Complexity or uncertainty of solutions", value: complexity },
            { label: "Cultural or social barriers", value: culturalBarriers },
            { label: "Resistance from stakeholders", value: stakeholderResistance },
            { label: "Other", value: other },
        ];

        // Sort ascending by value
        items.sort((a, b) => a.value - b.value);

        return {
            labels: items.map((item) => item.label),
            values: items.map((item) => item.value),
        } as const;
    }, [responses]);

    const data = useMemo<Data[]>(
        () => [
            {
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
            margin: { t: 50, r: 40, b: 60, l: 300 }, // Wide left margin
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            title: {
                text: "Hindrances to incorporating sustainability (Non-Incorporators)",
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

export default HindrancesToIncorporateSustainability;