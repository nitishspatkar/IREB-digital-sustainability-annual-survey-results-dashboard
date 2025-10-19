import { describe, expect, it } from "vitest";

import { SurveyResponse } from "./SurveyResponse";
import { SurveyRepository } from "./SurveyRepository";

describe("SurveyResponse", () => {
  const responses: readonly SurveyResponse[] =
    SurveyRepository.getSurvey("2025");

  it("gets the country of residence from the first filled column", () => {
    const response = responses.find((r) => r.raw.responseId === "29");

    expect(response).toBeDefined();
    expect(response!.getCountryOfResidence()).toBe("Germany");
  });
});
