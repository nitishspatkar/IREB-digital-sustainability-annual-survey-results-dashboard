import { GenericChart } from '../../../components/GraphViews';
import type { ChartProcessor } from '../../../components/GraphViews';

type CountStat = {
  label: string;
  sortKey: number;
  count: number;
};

const normalize = (v: string) => v.replace(/\s+/g, ' ').trim();

function categorizeCount(rawValue: string): { label: string; sortKey: number } | null {
  const value = normalize(rawValue);
  if (!value || value.toLowerCase() === 'n/a') return null;

  if (/^\d+$/.test(value)) {
    const n = Number(value);
    return { label: String(n), sortKey: n };
  }

  const lower = value.toLowerCase();

  const plusMatch = value.match(/(\d+)\s*\+/);
  if (plusMatch) {
    const n = Number(plusMatch[1]);
    return { label: value, sortKey: n + 0.001 };
  }
  const moreThanMatch = lower.match(/more than\s*(\d+)/);
  if (moreThanMatch) {
    const n = Number(moreThanMatch[1]);
    return { label: value, sortKey: n + 1 + 0.001 };
  }
  const greaterThanMatch = value.match(/>\s*(\d+)/);
  if (greaterThanMatch) {
    const n = Number(greaterThanMatch[1]);
    return { label: value, sortKey: n + 1 + 0.001 };
  }

  const rangeMatch = value.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (rangeMatch) {
    const a = Number(rangeMatch[1]);
    const b = Number(rangeMatch[2]);
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    return { label: value, sortKey: lo + (hi - lo) / 100 };
  }

  const firstNum = value.match(/(\d+)/);
  if (firstNum) {
    const n = Number(firstNum[1]);
    return { label: value, sortKey: n };
  }

  return { label: value, sortKey: Number.POSITIVE_INFINITY };
}

// The Logic (Pure Function)
// Precondition: Q10 = Yes (participatedInTraining)
const processData: ChartProcessor = (responses, palette) => {
  const counts = new Map<string, CountStat>();

  const participants = responses.filter(
    (r) => normalize(r.raw.participatedInTraining ?? '').toLowerCase() === 'yes'
  );

  participants.forEach((r) => {
    const cat = categorizeCount(r.raw.trainingCount ?? '');
    if (!cat) return;
    const key = cat.label;
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, { label: cat.label, sortKey: cat.sortKey, count: 1 });
    }
  });

  const stats = Array.from(counts.values()).sort((a, b) => a.sortKey - b.sortKey);
  const total = stats.reduce((sum, s) => sum + s.count, 0);

  return {
    traces: [
      {
        type: 'bar',
        x: stats.map((s) => s.label),
        y: stats.map((s) => s.count),
        marker: { color: palette.berry },
        text: stats.map((s) => s.count.toString()),
        textposition: 'outside',
        textfont: {
          family: 'PP Mori, sans-serif',
          size: 12,
          color: palette.grey,
        },
        cliponaxis: false,
        hoverinfo: 'none',
      },
    ],
    stats: {
      numberOfResponses: total,
      totalEligible: participants.length,
    },
  };
};

// The Component
const TrainingProgramsCount = () => {
  return (
    <GenericChart
      graphId="TrainingProgramsCount"
      processor={processData}
      layout={{
        margin: { t: 50, r: 0, b: 60, l: 48 },
        xaxis: {
          type: 'category',
          title: { text: 'Number of trainings' },
        },
        yaxis: { title: { text: 'Number of respondents' } },
      }}
    />
  );
};

export default TrainingProgramsCount;
