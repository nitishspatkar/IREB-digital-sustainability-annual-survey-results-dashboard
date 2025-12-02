import { useMemo } from "react";
import GraphWrapper from "../../../components/GraphWrapper";
import { useSurveyData } from "../../../data/SurveyContext";
import useThemeColor from "../../../hooks/useThemeColor";
import { columnDefinitions } from "../../../data/SurveyColumnDefinitions";

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

const TrainingDescriptionList = () => {
  const questionHeader = columnDefinitions.find(
    (c) => c.key === "trainingDescription"
  )?.header;
  const tickColor = useThemeColor("--color-ireb-grey-01");
  const borderColor = useThemeColor("--color-ireb-grey-01");

  const responses = useSurveyData();

  const descriptions = useMemo<string[]>(() => {
    // 1. Filter for users who answered "Yes" to Q10
    const participants = responses.filter(
      (r) =>
        normalize(r.raw.participatedInTraining ?? "").toLowerCase() === "yes"
    );

    // 2. Get their descriptions
    return participants
      .map((r) => normalize(r.raw.trainingDescription ?? ""))
      .filter(
        (desc) => desc.length > 0 && desc.toLowerCase() !== "n/a" // Remove empty/n.a.
      );
  }, [responses]);

  const participants = responses.filter(
    (r) => normalize(r.raw.participatedInTraining ?? "").toLowerCase() === "yes"
  );
  const numberOfResponses = descriptions.length;
  const totalResponses = responses.length;
  const responseRate =
    totalResponses > 0
      ? (participants.length / totalResponses) * 100
      : 0;

  const question =
    questionHeader ?? "Please describe the training programs you attended";
  const description =
    "Descriptions of training programs attended by respondents.";

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

export default TrainingDescriptionList;
