import {
  columnDefinitions,
  type SurveyColumnKey,
} from "./SurveyColumnDefinitions";

export type SurveyRecord = {
  [K in SurveyColumnKey]: string;
};

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (char === '"') {
      if (inQuotes) {
        if (text[i + 1] === '"') {
          currentValue += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        inQuotes = true;
      }
    } else if (char === "," && !inQuotes) {
      currentRow.push(currentValue);
      currentValue = "";
    } else if (char === "\n" && !inQuotes) {
      currentRow.push(currentValue);
      rows.push(currentRow);
      currentRow = [];
      currentValue = "";
    } else if (char === "\r") {
      // ignore carriage returns
      continue;
    } else {
      currentValue += char;
    }
  }

  currentRow.push(currentValue);
  rows.push(currentRow);

  // Remove trailing empty row caused by newline at EOF
  if (rows.length > 0 && rows[rows.length - 1].every((value) => value === "")) {
    rows.pop();
  }

  return rows;
}

/**
 * Cleans and standardizes a string by replacing non-breaking spaces with regular spaces
 * and trimming leading/trailing whitespace. Returns an empty string for null or undefined input.
 * @param {string | undefined} value The string to normalize.
 * @returns {string} The normalized string.
 */
function normalizeCell(value: string | undefined): string {
  if (!value) {
    return "";
  }

  return value.replace(/\u00a0/g, " ").trim();
}

export class SurveyCsvParser {
  private readonly records: SurveyRecord[];

  private constructor(records: SurveyRecord[]) {
    this.records = records;
  }

  static fromCsv(csv: string): SurveyCsvParser {
    const rows = parseCsv(csv);
    const [headerRow, ...dataRows] = rows;

    if (!headerRow) {
      throw new Error("CSV is missing a header row.");
    }

    const normalizedCsvHeaders = headerRow.map(normalizeCell);
    const headerIndexMap = new Map<SurveyColumnKey, number>();
    // Keep track of CSV column indices that have already been mapped.
    const usedIndices = new Set<number>();

    columnDefinitions.forEach((definition) => {
      const expectedHeader = normalizeCell(definition.header);
      
      // Search for the next available column that matches the header.
      let searchFromIndex = 0;
      let foundIndex = -1;

      // Loop to find a matching header that hasn't been used yet.
      while ((foundIndex = normalizedCsvHeaders.indexOf(expectedHeader, searchFromIndex)) !== -1) {
        if (!usedIndices.has(foundIndex)) {
          // Found an unused column, map it and mark it as used.
          headerIndexMap.set(definition.key, foundIndex);
          usedIndices.add(foundIndex);
          break; // Stop searching for this definition.
        }
        // This index was taken, continue searching from the next position.
        searchFromIndex = foundIndex + 1;
      }
    });

    const records: SurveyRecord[] = dataRows
      .filter((row) => row.some((cell) => normalizeCell(cell) !== ""))
      .map((row) => {
        const entry: Partial<SurveyRecord> = {};

        columnDefinitions.forEach((definition) => {
          const index = headerIndexMap.get(definition.key);
          if (index !== undefined && index < row.length) {
            entry[definition.key] = normalizeCell(row[index]);
          } else {
            entry[definition.key] = "";
          }
        });

        return entry as SurveyRecord;
      });

    return new SurveyCsvParser(records);
  }

  getAll(): readonly SurveyRecord[] {
    return this.records;
  }

  findByResponseId(responseId: string): SurveyRecord | undefined {
    return this.records.find((record) => record.responseId === responseId);
  }
}
