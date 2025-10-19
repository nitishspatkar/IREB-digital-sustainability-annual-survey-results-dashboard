import type { SurveyRecord } from "./SurveyCsvParser";
import type { SurveyColumnKey } from "./SurveyColumnDefinitions";

const countryOfResidenceColumns = [
  "countryOfResidence",
  "countryOfResidenceAlt1",
  "countryOfResidenceAlt2",
  "countryOfResidenceAlt3",
  "countryOfResidenceAlt4",
] as const satisfies readonly SurveyColumnKey[];

/**
 * Wrapper class that encapsulates a survey record and provides a nice API to access the data.
 * The wrapped data is immutable and should not be modified.
 */
export class SurveyResponse {
  private readonly data: Readonly<SurveyRecord>;
  public readonly year: string;

  /**
   * Creates a new SurveyResponse from raw survey data.
   * @param data The raw survey record data from the CSV parser
   * @param year The year this survey response belongs to
   */
  constructor(data: SurveyRecord, year: string) {
    this.data = Object.freeze({ ...data });
    this.year = year;
  }

  /**
   * Gets the raw survey record data.
   * Returns a readonly copy to prevent modifications.
   */
  get raw(): Readonly<SurveyRecord> {
    return this.data;
  }

  /**
   * Gets the country of residence for this survey response.
   * Returns the first non-empty country value from the possible country columns.
   * Returns an empty string if no country is specified.
   */
  getCountryOfResidence(): string {
    for (const column of countryOfResidenceColumns) {
      const value = this.data[column];
      if (value && value !== "") {
        return value;
      }
    }
    return "";
  }
}
