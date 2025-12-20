import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import GraphWrapper from "../../../components/GraphWrapper";
import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions";

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

const UsesTools = () => {
    const questionHeader = columnDefinitions.find(
        (c) => c.key === "usesTools"
    )?.header;

    const yesColor = useThemeColor("--color-ireb-spring");
    const noColor = useThemeColor("--color-ireb-mandarin");
    const barColor = useThemeColor("--color-ireb-grey-02");
    const tickColor = useThemeColor("--color-ireb-grey-01");

    const responses = useSurveyData();

    const stats = useMemo(() => {
        const counts = new Map<string, number>();
        counts.set("Yes", 0);
        counts.set("No", 0);
        counts.set("Not sure", 0);

        // --- Precondition: Q28 = Yes ---
        const filteredResponses = responses.filter(
            (r) =>
                normalize(
                    r.raw.personIncorporatesSustainability ?? ""
                ).toLowerCase() === "yes"
        );

        filteredResponses.forEach((r) => {
            // Key for Q31
            const raw = normalize(r.raw.usesTools ?? "");
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
            totalEligible: filteredResponses.length, // <--- EXPORTED FROM SCOPE
        };
    }, [responses]);

    const data = useMemo<Data[]>(
        () => [
            {
                x: stats.labels,
                y: stats.values,
                type: "bar",
                marker: {
                    color: stats.labels.map((label) => {
                        if (label === "Yes") {
                            return yesColor;
                        } else if (label === "No") {
                            return noColor;
                        } else {
                            return barColor;
                        }
                    }),
                },
                text: stats.values.map((v) => v.toString()),
                textposition: "outside",
                textfont: {
                    family: "PP Mori, sans-serif",
                    size: 12,
                    color: tickColor,
                },
                cliponaxis: false,
                hoverinfo: "none",
            },
        ],
        [stats, barColor, yesColor, noColor, tickColor]
    );

    const layout = useMemo<Partial<Layout>>(
        () => ({
            margin: { t: 50, r: 20, b: 60, l: 48 },
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            xaxis: {
                tickfont: { family: "PP Mori, sans-serif", size: 12, color: tickColor },
            },
            yaxis: {
                title: {
                    text: "Number of Respondents",
                    font: { family: "PP Mori, sans-serif", size: 12, color: tickColor },
                },
                tickfont: { family: "PP Mori, sans-serif", size: 12, color: tickColor },
            },
        }),
        [tickColor]
    );

    const numberOfResponses = stats.values.reduce((a, b) => a + b, 0);

    // Use the value exported from useMemo
    const totalResponses = stats.totalEligible;

    const responseRate =
        totalResponses > 0
            ? (numberOfResponses / totalResponses) * 100
            : 0;

    const question =
        questionHeader ??
        "Do you use tools, methods, or checklists for addressing digital sustainability in your work?";
    const description =
        "Shows whether respondents use specific tools or methods for digital sustainability.";

    return (
        <GraphWrapper
            question={question}
            description={description}
            numberOfResponses={numberOfResponses}
            responseRate={responseRate}
        >
            <div className="h-[520px]">
                <Plot
                    data={data}
                    layout={layout}
                    config={{ displayModeBar: false, responsive: true }}
                    useResizeHandler
                    style={{ width: "100%", height: "100%" }}
                />
            </div>
        </GraphWrapper>
    );
};

export default UsesTools;