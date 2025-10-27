import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";

const AdditionalSupportResources = () => {
    const barColor = useThemeColor("--color-plum-400");
    const titleColor = useThemeColor("--color-ink-900");
    const tickColor = useThemeColor("--color-ink-700");

    const responses = useSurveyData();

    const counts = useMemo(() => {
        const norm = (v: string) => v?.trim().toLowerCase() ?? "";

        let theoretical = 0;
        let tutorials = 0;
        let curricula = 0;
        let practical = 0;
        let caseStudies = 0;
        let structures = 0;
        let tools = 0;
        let none = 0;
        let other = 0;

        responses.forEach((r) => {
            const raw = r.raw;
            if (norm(raw.supportNeedTheoretical) === "yes") theoretical += 1;
            if (norm(raw.supportNeedTutorials) === "yes") tutorials += 1;
            if (norm(raw.supportNeedCurricula) === "yes") curricula += 1;
            if (norm(raw.supportNeedPractical) === "yes") practical += 1;
            if (norm(raw.supportNeedCaseStudies) === "yes") caseStudies += 1;
            if (norm(raw.supportNeedStructures) === "yes") structures += 1;
            if (norm(raw.supportNeedTools) === "yes") tools += 1;
            if (norm(raw.supportNeedNone) === "yes") none += 1;

            const otherVal = norm(raw.supportNeedOther);
            if (otherVal.length > 0 && otherVal !== "n/a") other += 1;
        });

        const items = [
            { label: "Theoretical knowledge (self-study)", value: theoretical },
            { label: "Tutorials (training)", value: tutorials },
            { label: "Curricula (programs)", value: curricula },
            { label: "Practical knowledge (how-to's)", value: practical },
            { label: "Positive case studies", value: caseStudies },
            { label: "Structures (frameworks/standards)", value: structures },
            { label: "Tools (checklists/methods)", value: tools },
            { label: "No additional support needed", value: none },
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
            margin: { t: 50, r: 40, b: 60, l: 250 }, // Adjusted margins
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            title: {
                text: "Support/resources needed to integrate digital sustainability",
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

export default AdditionalSupportResources;