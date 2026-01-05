# Year Comparison System - Usage Guide

This system enables charts to compare data across different years by separating data extraction from visualization.

## Architecture

1.  **`DataExtractor<T>`**: Extracts and normalizes survey data.
2.  **`ComparisonStrategy<T>`**: Merges extracted data from two years into a single visualization.
3.  **`GenericChart`**: Manages orchestration and UI controls.

---

## How to Add Comparison to a Chart

### Step 1: Define your data extractor

Process responses and return normalized data (e.g., `HorizontalBarData`).

```typescript
import type { DataExtractor } from '../../../components/GraphViews';
import { type HorizontalBarData } from '../../../components/ComparisonStrategies';

const myDataExtractor: DataExtractor<HorizontalBarData> = (responses) => {
  let count1 = 0;
  let count2 = 0;

  responses.forEach((r) => {
    if (r.raw.someField === 'value1') count1++;
    if (r.raw.someField === 'value2') count2++;
  });

  return {
    items: [
      { label: 'Category 1', value: count1 },
      { label: 'Category 2', value: count2 },
    ],
    stats: {
      numberOfResponses: count1 + count2,
      totalEligible: responses.length,
    },
  };
};
```

### Step 2: Update your processor

Use the extractor within your existing chart processor.

```typescript
const myProcessor: ChartProcessor = (responses, palette) => {
  const data = myDataExtractor(responses);
  const sortedItems = [...data.items].sort((a, b) => a.value - b.value);

  const traces: Data[] = [
    {
      type: 'bar',
      orientation: 'h',
      x: sortedItems.map((i) => i.value),
      y: sortedItems.map((i) => i.label),
      marker: { color: palette.berry },
    },
  ];

  return { traces, stats: data.stats };
};
```

### Step 3: Add comparison props to GenericChart

Pass the extractor and strategy to the component.

```typescript
import { horizontalBarComparisonStrategy } from '../../../components/ComparisonStrategies';

export const MyChart = () => {
  return (
    <GenericChart
      graphId="MyChart"
      processor={myProcessor}
      layout={myLayout}
      dataExtractor={myDataExtractor}
      comparisonStrategy={horizontalBarComparisonStrategy}
    />
  );
};
```

---

## Creating New Comparison Strategies

To support new chart types (e.g., Pie, Heatmap):

1.  **Define the data structure:**

    ```typescript
    export interface MyChartData {
      values: number[];
      labels: string[];
      stats: {
        numberOfResponses: number;
        totalEligible?: number;
      };
    }
    ```

2.  **Create the strategy:**

    ```typescript
    export const myChartComparisonStrategy: ComparisonStrategy<MyChartData> = (
      currentYearData,
      compareYearData,
      currentYear,
      compareYear,
      palette
    ) => {
      const traces: Data[] = [
        ,/* Trace for current year */
        /* Trace for compare year */
      ];

      return {
        traces,
        stats: {
          numberOfResponses:
            currentYearData.stats.numberOfResponses + compareYearData.stats.numberOfResponses,
          totalEligible:
            (currentYearData.stats.totalEligible ?? 0) + (compareYearData.stats.totalEligible ?? 0),
        },
      };
    };
    ```

## Examples

- `DriversToIncorporateSustainability.tsx`
- `SustainabilityDimensionsInTasks.tsx`
