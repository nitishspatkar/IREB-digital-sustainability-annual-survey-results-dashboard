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
          color: plum400,
        },
      },
    ],
    [experienceStats, plum400]
  );

  const layout: Partial<Layout> = useMemo(
    () => ({
      title: {
        text: "How many years of professional experience do you have?",
      },
      xaxis: {
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
      margin: { t: 40, r: 40, b: 150, l: 60 },
    }),
    [ink900]
  );

  return (
    <div className="bg-lavender-100 rounded-2xl shadow-card w-full h-[520px]">
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
