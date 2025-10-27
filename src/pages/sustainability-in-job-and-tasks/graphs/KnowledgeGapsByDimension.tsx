import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";

const KnowledgeGapsByDimension = () => {
    const barColor = useThemeColor("--color-plum-400");
    const titleColor = useThemeColor("--color-ink-900");
    const tickColor = useThemeColor("--color-ink-700");

    const responses = useSurveyData();

    const counts = useMemo(() => {
        const norm = (v: string) => v?.trim().toLowerCase() ?? "";

        let environmental = 0;
        let social = 0;
        let individual = 0;
        let economic = 0;
        let technical = 0;
        let none = 0;
        let other = 0;

        responses.forEach((r) => {
            const raw = r.raw;
            if (norm(raw.lackKnowledgeEnvironmental) === "yes") environmental += 1;
            if (norm(raw.lackKnowledgeSocial) === "yes") social += 1;
            if (norm(raw.lackKnowledgeIndividual) === "yes") individual += 1;
            if (norm(raw.lackKnowledgeEconomic) === "yes") economic += 1;
            if (norm(raw.lackKnowledgeTechnical) === "yes") technical += 1;
            if (norm(raw.lackKnowledgeNone) === "yes") none += 1;

            const otherVal = norm(raw.lackKnowledgeOther);
            if (otherVal.length > 0 && otherVal !== "n/a") other += 1;
        });

        const items = [
            { label: "Environmental", value: environmental },
            { label: "Social", value: social },
            { label: "Individual", value: individual },
            { label: "Economic", value: economic },
            { label: "Technical", value: technical },
            { label: "None", value: none },
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
            margin: { t: 50, r: 40, b: 60, l: 120 }, // Adjusted margins
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            title: {
                text: "Knowledge gaps by sustainability dimension",
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

export default KnowledgeGapsByDimension;