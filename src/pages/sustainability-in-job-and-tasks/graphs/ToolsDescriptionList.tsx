import { useMemo } from "react";
// Ensure these paths match your project structure
import GraphWrapper from "../../../components/GraphWrapper";
import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions";

// Helper to clean strings
const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

const ToolsDescriptionList = () => {
    const questionHeader = columnDefinitions.find(
        (c) => c.key === "toolsDescription"
    )?.header;

    const tickColor = useThemeColor("--color-ireb-grey-01");
    const borderColor = useThemeColor("--color-ireb-grey-01");

    const responses = useSurveyData();

    // We return an object containing BOTH the text list and the count of people who said "Yes"
    const { descriptions, totalEligibleRespondents } = useMemo(() => {
        // 1. Precondition: Q31 = Yes
        const filteredResponses = responses.filter(
            (r) => normalize(r.raw.usesTools ?? "").toLowerCase() === "yes"
        );

        // 2. Get their descriptions from Q32
        const texts = filteredResponses
            .map((r) => normalize(r.raw.toolsDescription ?? ""))
            .filter(
                (desc) => desc.length > 0 && desc.toLowerCase() !== "n/a"
            );

        return {
            descriptions: texts,
            totalEligibleRespondents: filteredResponses.length, // Capture length inside scope
        };
    }, [responses]);

    const numberOfResponses = descriptions.length;

    // Calculate rate based on those who said "Yes" (eligible) vs those who actually wrote text
    const responseRate =
        totalEligibleRespondents > 0
            ? (numberOfResponses / totalEligibleRespondents) * 100
            : 0;

    const question =
        questionHeader ?? "What tools, methods, or checklists do you use?";
    const description =
        "Free-text responses from tool users describing the tools and methods they employ.";

    return (
        <GraphWrapper
            question={question}
            description={description}
            numberOfResponses={numberOfResponses}
            responseRate={responseRate}
        >
            <div className="h-[520px]">
                <ul className="h-full overflow-y-auto" style={{ color: tickColor }}>
                    {descriptions.map((desc, index) => (
                        <li
                            key={index}
                            className="border-b px-2 py-3 text-sm"
                            style={{ borderColor: borderColor }}
                        >
                            {desc}
                        </li>
                    ))}
                </ul>
            </div>
        </GraphWrapper>
    );
};

export default ToolsDescriptionList;