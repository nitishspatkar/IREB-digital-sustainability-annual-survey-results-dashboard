import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

const OrganizationDepartmentCoordination = () => {
    const barColor = useThemeColor("--color-plum-400");
    const titleColor = useThemeColor("--color-ink-900");
    const tickColor = useThemeColor("--color-ink-700");

    const responses = useSurveyData();

    const stats = useMemo(() => {
        const counts = new Map<string, number>();
        counts.set("Yes", 0);
        counts.set("No", 0);
        counts.set("Not sure", 0);

        // --- Precondition: Q17 = Yes ---
        const filteredResponses = responses.filter(
            (r) =>
                normalize(r.raw.organizationHasDigitalSustainabilityGoals ?? "")
                    .toLowerCase() === "yes"
        );

        filteredResponses.forEach((r) => {
            // Key for Q20
            const raw = normalize(r.raw.organizationDepartmentCoordination ?? "");
            const lower = raw.toLowerCase();

            if (lower === "yes") {
                counts.set("Yes", (counts.get("Yes") ?? 0) + 1);
            } else if (lower === "no") {
                counts.set("No", (counts.get("No") ?? 0) + 1);
            } else if (lower === "not sure") {
                counts.set("Not sure", (counts.get("Not sure") ?? 0) + 1);
            }
        });

        const labels = ["Yes", "No", "Not sure"];
        return {
            labels,
            values: labels.map((label) => counts.get(label) ?? 0),
        };
    }, [responses]);

    const data = useMemo<Data[]>(
        () => [
            {
                x: stats.labels,
                y: stats.values,
                type: "bar",
                marker: { color: barColor },
                text: stats.values.map((v) => v.toString()),
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
            margin: { t: 50, r: 20, b: 60, l: 48 },
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            title: {
                text: "Do departments coordinate? (Orgs with Goals Only)",
                font: { family: "Inter, sans-serif", size: 18, color: titleColor },
            },
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

    const total = stats.values.reduce((a, b) => a + b, 0);

    return (
        <div className="h-[520px] w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            {total === 0 ? (
                <div className="flex h-full items-center justify-center text-ink-700">
                    No data available for organizations with goals.
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

export default OrganizationDepartmentCoordination;