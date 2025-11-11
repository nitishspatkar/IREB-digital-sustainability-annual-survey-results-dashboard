import { useMemo } from "react";
import Plot from "react-plotly.js";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions";
import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import type { Data, Layout } from "plotly.js";

export function DemographicProfessionalExperience() {
    const questionHeader =
        columnDefinitions.find((c) => c.key === "professionalExperienceYears")?.header
    const surveyResponses = useSurveyData();
    const chartBarColor = useThemeColor("--color-plum-400");
    const titleColor = useThemeColor("--color-ink-900");
    const tickColor = useThemeColor("--color-ink-700");

    const experienceStats = useMemo(() => {
        const counts = new Map<string, number>();
        surveyResponses.forEach((response) => {
            const experience = response.raw.professionalExperienceYears ?? "";
            if (experience.length > 0 && experience.toLowerCase() !== "n/a") {
                counts.set(experience, (counts.get(experience) ?? 0) + 1);
            }
        });
        return Array.from(counts.entries())
            .map(([experience, count]) => ({ experience, count }))
            .sort((a, b) => {
                const aMatch = a.experience.match(/^(\d+)/);
                const bMatch = b.experience.match(/^(\d+)/);
                if (a.experience.startsWith("Less than")) return -1;
                if (b.experience.startsWith("Less than")) return 1;
                if (a.experience.startsWith("More than")) return 1;
                if (b.experience.startsWith("More than")) return -1;
                if (aMatch && bMatch) {
                    return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
                }
                return a.experience.localeCompare(b.experience);
            });
    }, [surveyResponses]);

    const data: Data[] = useMemo(
        () => [
            {
                x: experienceStats.map((item) => item.experience),
                y: experienceStats.map((item) => item.count),
                type: "bar",
                marker: {
                    color: chartBarColor,
                },
                text: experienceStats.map((item) => item.count.toString()),
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
        [experienceStats, chartBarColor, tickColor]
    );

    const layout: Partial<Layout> = useMemo(
        () => ({
            margin: { t: 50, r: 40, b: 60, l: 60 },
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            xaxis: {
                automargin: true,
                title: {
                    text: "Years of Experience",
                    font: {
                        family: "Inter, sans-serif",
                        size: 12,
                        color: tickColor,
                    },
                },
                // --- THIS IS THE FIX: tickangle is GONE ---
                tickfont: {
                    family: "Inter, sans-serif",
                    size: 12,
                    color: tickColor,
                },
            },
            yaxis: {
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
        }),
        [titleColor, tickColor]
    );

    return (
        <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3
                className="text-lg text-center"
                style={{ color: titleColor }}
            >
                {questionHeader}
            </h3>
            <div className="mt-4 h-[520px]">
            <Plot
                data={data}
                layout={layout}
                style={{ width: "100%", height: "100%" }}
                useResizeHandler
                config={{ displayModeBar: false, responsive: true }}
            />
            </div>
        </div>
    );
}