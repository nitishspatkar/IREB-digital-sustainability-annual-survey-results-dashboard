import { useMemo } from "react";
import GraphWrapper from "../../../components/GraphWrapper";
import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions";

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

const ToolsDescriptionList = () => {
  const questionHeader = columnDefinitions.find(
    (c) => c.key === "toolsDescription"
  )?.header;
  const tickColor = useThemeColor("--color-ink-700");
  const borderColor = useThemeColor("--color-ink-200");

  const responses = useSurveyData();

  const descriptions = useMemo<string[]>(() => {
    // --- Precondition: Q31 = Yes ---
    const filteredResponses = responses.filter(
      (r) => normalize(r.raw.usesTools ?? "").toLowerCase() === "yes"
    );

    // 2. Get their descriptions from Q32
    return filteredResponses
      .map((r) => normalize(r.raw.toolsDescription ?? ""))
      .filter(
        (desc) => desc.length > 0 && desc.toLowerCase() !== "n/a" // Remove empty/n.a.
      );
  }, [responses]);

  const numberOfResponses = descriptions.length;
  const totalResponses = responses.length;
  const responseRate =
    totalResponses > 0
      ? Math.round((numberOfResponses / totalResponses) * 100)
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
