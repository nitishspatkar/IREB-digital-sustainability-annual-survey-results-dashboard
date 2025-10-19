import { SurveyCsvParser } from "./SurveyCsvParser";
import { SurveyResponse } from "./SurveyResponse";

/**
 * Repository for managing survey data.
 * Uses SurveyCsvParser to load CSV data and wraps it in SurveyResponse objects.
 */
export class SurveyRepository {
  private static surveyModules = import.meta.glob<string>("./*.csv", {
    as: "raw",
    eager: true,
  });
  private static cachedSurveys: Map<string, SurveyResponse[]> = new Map();

  private static getYearFromPath(path: string): string {
    const fileName = path.split("/").pop();
    return fileName ? fileName.replace(".csv", "") : "";
  }

  static getAvailableYears(): readonly string[] {
    return Object.keys(this.surveyModules).map(this.getYearFromPath).sort();
  }

  /**
   * Gets survey responses for a specific year.
   * Uses SurveyCsvParser to parse the CSV and wraps each record in a SurveyResponse.
   * Results are cached for performance.
   */
  static getSurvey(year: string): readonly SurveyResponse[] {
    const path = `./${year}.csv`;
    const csvContent = this.surveyModules[path];

    if (!csvContent) {
      return [];
    }

    if (!this.cachedSurveys.has(year)) {
      // Use SurveyCsvParser to get raw data from CSV
      const parser = SurveyCsvParser.fromCsv(csvContent);
      const rawRecords = parser.getAll();

      // Wrap each raw record in a SurveyResponse
      const responses = rawRecords.map(
        (record) => new SurveyResponse(record, year)
      );

      this.cachedSurveys.set(year, responses);
    }

    return this.cachedSurveys.get(year) ?? [];
  }
}
