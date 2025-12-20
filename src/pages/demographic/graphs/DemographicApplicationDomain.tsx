import { useMemo } from "react";
import type { Data, Layout } from "plotly.js";

import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions";
// IMPORTIERE DIE NEUEN GENERISCHEN VIEWS
import { SurveyChart, SurveyExploreList } from "../../../components/GraphViews";

// --- DATEN LOGIK (Hook) ---
// Das bleibt lokal, da es spezifisch für DIESE Frage ist
const useApplicationDomainData = () => {
    const surveyResponses = useSurveyData();
    const chartBarColor = useThemeColor("--color-ireb-berry");
    const tickColor = useThemeColor("--color-ireb-grey-01");

    const normalize = (val: string) => val.replace(/\s+/g, " ").trim();

    // Stats berechnen
    const stats = useMemo(() => {
        const counts = new Map<string, number>();
        surveyResponses.forEach((r) => {
            const val = normalize(r.raw.primaryApplicationDomain ?? "");
            if (val && val.toLowerCase() !== "n/a") {
                counts.set(val, (counts.get(val) ?? 0) + 1);
            }
        });
        return Array.from(counts.entries())
            .map(([domain, count]) => ({ domain, count }))
            .sort((a, b) => b.count - a.count);
    }, [surveyResponses]);

    // "Other" Texte sammeln
    // --- CHANGED SECTION ---
    const otherTexts = useMemo(() => {
        return surveyResponses
            .filter((r) => {
                // 1. Get the main domain selection
                const domain = normalize(r.raw.primaryApplicationDomain ?? "");
                // 2. Only proceed if the selection is "other"
                return domain.toLowerCase() === "other";
            })
            .map((r) => normalize(r.raw.primaryApplicationDomainOther ?? ""))
            .filter((v) => v.length > 0);
    }, [surveyResponses]);
    // -----------------------

    return { stats, otherTexts, chartBarColor, tickColor, surveyResponses };
};


// --- EXPORT 1: DAS DIAGRAMM (für das Dashboard) ---
export const DemographicApplicationDomain = ({
                                                 className,
                                                 onExplore
                                             }: {
    className?: string;
    onExplore?: () => void
}) => {
    const { stats, otherTexts, chartBarColor, tickColor, surveyResponses } = useApplicationDomainData();

    // Plotly Daten konfigurieren
    const chartData: Data[] = useMemo(() => [{
        x: stats.map((i) => i.count),
        y: stats.map((i) => i.domain),
        type: "bar",
        orientation: "h",
        marker: { color: chartBarColor },
        text: stats.map((i) => i.count.toString()),
        textposition: "outside",
        hoverinfo: "y+x",
        textfont: { color: tickColor },
    }], [stats, chartBarColor, tickColor]);

    const layout: Partial<Layout> = useMemo(() => ({
        margin: { t: 40, r: 40, b: 40, l: 250 },
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        xaxis: {
            zeroline: false,
            tickfont: {
                family: "PP Mori, sans-serif",
                size: 12,
                color: tickColor
            },
            title: {
                text: "Number of Respondents",
                font: {
                    family: "PP Mori, sans-serif",
                    size: 12,
                    color: tickColor,
                },
            },
        },
        yaxis: {
            autorange: "reversed",
            showline: true,
            tickfont: {
                family: "PP Mori, sans-serif",
                size: 12,
                color: tickColor,
            },
            automargin: true,
            ticks: "outside",
            ticklen: 10,
            tickcolor: "rgba(0,0,0,0)",
        },
        showlegend: false,
    }), [tickColor]);

    // Texte holen
    const header = columnDefinitions.find(c => c.key === "primaryApplicationDomain")?.header;
    const question = header ?? "In which application domain do you currently primarily work?";

    // Raten berechnen
    const numResp = stats.reduce((acc, curr) => acc + curr.count, 0);
    const rate = surveyResponses.length > 0 ? (numResp / surveyResponses.length) * 100 : 0;

    // --> RENDER GENERISCHE KOMPONENTE
    return (
        <SurveyChart
            className={className}
            question={question}
            description="Breaks down the primary application domains represented by respondents."
            numberOfResponses={numResp}
            responseRate={rate}
            data={chartData}
            layout={layout}
            hasExploreData={otherTexts.length > 0}
            onExplore={onExplore}
        />
    );
};


// --- EXPORT 2: DIE DETAIL SEITE (für die Explore Ansicht) ---
export const DemographicApplicationDomainDetails = ({ onBack }: { onBack: () => void }) => {
    const { stats, otherTexts } = useApplicationDomainData();

    // Texte holen
    const mainHeader = columnDefinitions.find(c => c.key === "primaryApplicationDomain")?.header;
    const otherHeader = columnDefinitions.find(c => c.key === "primaryApplicationDomainOther")?.header;

    const title = mainHeader ?? "Primary Application Domain";
    const question = otherHeader ?? "In which application domain do you currently primarily work? [Other]";

    // Raten für "Other" berechnen
    const numOther = otherTexts.length;
    const totalOtherCategory = stats.find(s => s.domain.toLowerCase().includes("other"))?.count ?? 0;
    const rate = totalOtherCategory > 0 ? (numOther / totalOtherCategory) * 100 : 0;

    // --> RENDER GENERISCHE KOMPONENTE
    return (
        <SurveyExploreList
            title={title}
            items={otherTexts}
            question={question}
            description="Lists the free-text application domains supplied under the Other option."
            numberOfResponses={numOther}
            responseRate={rate}
            onBack={onBack}
        />
    );
};

export default DemographicApplicationDomain;