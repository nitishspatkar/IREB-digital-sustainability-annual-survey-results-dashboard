import { useMemo } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout } from "plotly.js";

import GraphWrapper from "../../../components/GraphWrapper";
import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions";

type DiscussionFrequencyStat = {
    frequency: string;
    count: number;
};

const normalizeFrequency = (value: string) => value.replace(/\s+/g, " ").trim();

const DiscussionFrequency = () => {
    const questionHeader =
        columnDefinitions.find((c) => c.key === "participatedInTraining")?.header
    const questionHeaderOther =
        columnDefinitions.find((c) => c.key === "discussionFrequencyOther")?.header
    const chartBarColor = useThemeColor("--color-plum-400");
    const titleColor = useThemeColor("--color-ink-900");
    const tickColor = useThemeColor("--color-ink-700");
    const borderColor = useThemeColor("--color-ink-200");
    const surveyResponses = useSurveyData();

    const frequencyStats = useMemo<DiscussionFrequencyStat[]>(() => {
        const counts = new Map<string, number>();

        surveyResponses.forEach((response) => {
            const frequency = normalizeFrequency(
                response.raw.discussionFrequency ?? ""
            );
            if (
                frequency.length > 0 &&
                frequency.toLowerCase() !== "n/a"
            ) {
                counts.set(frequency, (counts.get(frequency) ?? 0) + 1);
            }
        });

        return Array.from(counts.entries())
            .map(([frequency, count]) => ({ frequency, count }))
            .sort((a, b) => a.count - b.count);
    }, [surveyResponses]);

    const otherFrequencyTexts = useMemo(() => {
        return surveyResponses
            .map((response) => normalizeFrequency(response.raw.discussionFrequencyOther ?? ""))
            .filter((value) => value.length > 0);
    }, [surveyResponses]);

    const chartData = useMemo<Data[]>(() => {

        return [
            {
                // --- CHANGES FOR HORIZONTAL BAR ---
                type: "bar",
                orientation: "h",
                x: frequencyStats.map((item) => item.count),
                y: frequencyStats.map((item) => item.frequency),
                // --- END CHANGES ---
                marker: {
                    color: chartBarColor,
                },
                text: frequencyStats.map((item) => item.count.toString()),
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
    }, [frequencyStats, chartBarColor, tickColor]);

    const layout = useMemo<Partial<Layout>>(
        () => ({
            margin: { t: 50, r: 40, b: 60, l: 240 }, // mehr Platz links
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            xaxis: {
                title: {
                    text: "Number of Respondents",
                    font: {
                        family: "Inter, sans-serif",
                        size: 12,
                        color: tickColor,
                    },
                },
                tickfont: {
                    family: "Inter, sans-serif",
                    size: 12,
                    color: tickColor,
                },
            },
            yaxis: {
                tickfont: {
                    family: "Inter, sans-serif",
                    size: 12,
                    color: tickColor,
                },
                automargin: true, // wichtig
            },
        }),
        [titleColor, tickColor]
    );


    const numberOfResponses = frequencyStats.reduce((sum, stat) => sum + stat.count, 0);
    const totalResponses = surveyResponses.length;
    const responseRate =
        totalResponses > 0
            ? Math.round((numberOfResponses / totalResponses) * 100)
            : 0;

    const question = questionHeader ?? "How often do you discuss digital sustainability in your professional environment?";
    const description = "Shows the frequency of digital sustainability discussions among respondents.";

    return (
        <>
        <GraphWrapper
            question={question}
            description={description}
            numberOfResponses={numberOfResponses}
            responseRate={responseRate}
        >
            <div className="h-[520px]">
                <Plot
                    data={chartData}
                    layout={layout}
                    style={{ width: "100%", height: "100%" }}
                    useResizeHandler
                    config={{ displayModeBar: false, responsive: true }}
                />
            </div>
        </GraphWrapper>

        {otherFrequencyTexts.length > 0 && (
            <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3
                    className="text-lg text-center"
                    style={{ color: titleColor }}
                >
                    {questionHeaderOther}
                </h3>
                <div className="mt-4 h-[520px]">
                    <ul
                        className="h-[calc(100%-40px)] overflow-y-auto"
                        style={{ color: tickColor }}
                    >
                        {otherFrequencyTexts.map((text, index) => (
                            <li
                                key={index}
                                className="border-b px-2 py-3 text-sm"
                                style={{ borderColor: borderColor }}
                            >
                                {text}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        )}
        </>
    );
};

export default DiscussionFrequency;