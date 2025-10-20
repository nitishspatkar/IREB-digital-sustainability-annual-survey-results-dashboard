import { useMemo } from "react";
import Plot from "react-plotly.js";
import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import type { Data, Layout } from "plotly.js";

export function DemographicProfessionalExperience() {
    const surveyResponses = useSurveyData();
    const plum400 = useThemeColor("--color-plum-400");
    const ink900 = useThemeColor("--color-ink-900");

    const experienceStats = useMemo(() => {
        // ... Logik bleibt unverändert
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
            // ... Daten bleiben unverändert
            {
                x: experienceStats.map((item) => item.experience),
                y: experienceStats.map((item) => item.count),
                type: "bar",
                marker: {
                    color: plum400,
                },
            },
        ],
        [experienceStats, plum400]
    );

    const layout: Partial<Layout> = useMemo(
        () => ({
            // ... Layout bleibt unverändert
            title: {
                text: "How many years of professional experience do you have?",
            },
            xaxis: {
                automargin: true,
                title: {
                    text: "Years of Experience",
                },
                tickangle: -45,
            },
            yaxis: {
                title: {
                    text: "Number of Respondents",
                },
            },
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            font: {
                color: ink900,
            },
            margin: { t: 40, r: 40, b: 80, l: 60 },
        }),
        [ink900]
    );

    return (
        // --- ÄNDERUNG HIER ---
        // Die Klassen wurden an die der anderen Komponenten angeglichen.
        <div className="h-[520px] w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <Plot
                data={data}
                layout={layout}
                style={{ width: "100%", height: "100%" }}
                useResizeHandler
                config={{ displayModeBar: false, responsive: true }}
            />
        </div>
    );
}