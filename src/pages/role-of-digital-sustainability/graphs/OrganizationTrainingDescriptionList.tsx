import { useMemo } from "react";
import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions.ts";
import GraphWrapper from "../../../components/GraphWrapper";

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

const OrganizationTrainingDescriptionList = () => {
  const questionHeader = columnDefinitions.find(
    (c) => c.key === "organizationTrainingDescription"
  )?.header;
  const tickColor = useThemeColor("--color-ink-700");
  const borderColor = useThemeColor("--color-ink-200");

  const responses = useSurveyData();

  const descriptions = useMemo<string[]>(() => {
    // --- Precondition: Q23 = Yes ---
    const filteredResponses = responses.filter(
      (r) =>
        normalize(r.raw.organizationOffersTraining ?? "").toLowerCase() ===
        "yes"
    );

    // 2. Get their descriptions from Q24
    return filteredResponses
      .map((r) => normalize(r.raw.organizationTrainingDescription ?? ""))
      .filter(
        (desc) => desc.length > 0 && desc.toLowerCase() !== "n/a" // Remove empty/n.a.
      );
  }, [responses]);

  const filteredTotal = responses.filter(
    (r) =>
      normalize(r.raw.organizationOffersTraining ?? "").toLowerCase() === "yes"
  ).length;
  const responseRate =
    filteredTotal > 0
      ? Math.round((descriptions.length / filteredTotal) * 100)
      : 0;

  const question =
    questionHeader ?? "What training does your organization offer?";
  const description =
    "Open-text descriptions from organizations that offer training on sustainable digital solutions.";

  return (
    <GraphWrapper
      question={question}
      description={description}
      numberOfResponses={descriptions.length}
      responseRate={responseRate}
    >
      <div className="h-[520px]">
        {descriptions.length === 0 ? (
          <div
            className="flex h-full items-center justify-center"
            style={{ color: tickColor }}
          >
            No descriptions provided.
          </div>
        ) : (
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
        )}
      </div>
    </GraphWrapper>
  );
};

export default OrganizationTrainingDescriptionList;
