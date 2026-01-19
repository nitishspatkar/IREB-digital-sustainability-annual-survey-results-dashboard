import { GenericChart } from '../../../components/GraphViews';
import type { ChartProcessor, DataExtractor } from '../../../components/GraphViews';
import { OrganizationOffersTrainingByAge } from '../../explore-graphs/OrganizationOffersTrainingByAge.tsx';
import { OrganizationOffersTrainingByRole } from '../../explore-graphs/OrganizationOffersTrainingByRole.tsx';
import { OrganizationOffersTrainingByOrgType } from '../../explore-graphs/OrganizationOffersTrainingByOrgType.tsx';
import { OrganizationOffersTrainingByRegion } from '../../explore-graphs/OrganizationOffersTrainingByRegion.tsx';
import OrganizationMeasures from '../../explore-graphs/OrganizationMeasures.tsx';
import { NoTrainingReasonsByTrainingOffer } from '../../explore-graphs/NoTrainingReasonsByTrainingOffer.tsx';
import { TrainingParticipationByTrainingOffer } from '../../explore-graphs/TrainingParticipationByTrainingOffer.tsx';
import { OrganizationalPracticesByOrgType } from '../../explore-graphs/OrganizationalPracticesByOrgType.tsx';
import {
  yesNoNotSureComparisonStrategy,
  type YesNoNotSureData,
} from '../../../components/comparision-components/YesNoNotSureComparisonStrategy';

// Data Extractor: Extracts Yes/No/Not Sure counts (ignores Unknown for comparison)
const dataExtractor: DataExtractor<YesNoNotSureData> = (responses) => {
  const norm = (v: string) => (v ?? '').trim().toLowerCase();

  let yesCount = 0;
  let noCount = 0;
  let notSureCount = 0;

  responses.forEach((r) => {
    const v = norm(r.raw.organizationOffersTraining as unknown as string);
    if (v === 'yes') yesCount++;
    else if (v === 'no') noCount++;
    else if (v === 'not sure') notSureCount++;
  });

  const total = yesCount + noCount + notSureCount;

  return {
    counts: {
      yes: yesCount,
      no: noCount,
      notSure: notSureCount,
    },
    stats: {
      numberOfResponses: total,
    },
  };
};

// The Logic (Pure Function)
const processData: ChartProcessor = (responses, palette) => {
  const norm = (v: string) => (v ?? '').trim().toLowerCase();

  let yes = 0;
  let no = 0;
  let notSure = 0;
  let unknown = 0;

  responses.forEach((r) => {
    const v = norm(r.raw.organizationOffersTraining as unknown as string);
    if (v === 'yes') yes += 1;
    else if (v === 'no') no += 1;
    else if (v === 'not sure') notSure += 1;
    else if (v === '') {
      return;
    } else if (v !== 'n/a') {
      unknown += 1;
    }
  });

  const labels: string[] = ['Yes', 'No', 'Not sure'];
  const values: number[] = [yes, no, notSure];
  if (unknown > 0) {
    labels.push('Unknown');
    values.push(unknown);
  }

  const total = values.reduce((a, b) => a + b, 0);

  return {
    traces: [
      {
        type: 'bar',
        x: labels,
        y: values,
        marker: {
          color: labels.map((label) => {
            if (label === 'Yes') return palette.spring;
            if (label === 'No') return palette.mandarin;
            return palette.grey02;
          }),
        },
        text: values.map((v) => v.toString()),
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
    },
  };
};

// The Component
const OrganizationOffersTraining = ({ onExplore }: { onExplore?: () => void }) => {
  return (
    <GenericChart
      graphId="OrganizationOffersTraining"
      processor={processData}
      layout={{
        margin: { t: 50, r: 0, b: 60, l: 48 },
        yaxis: { title: { text: 'Number of respondents' } },
      }}
      exploreComponents={[
        OrganizationMeasures,
        OrganizationOffersTrainingByRole,
        OrganizationOffersTrainingByRegion,
        OrganizationOffersTrainingByAge,
        OrganizationOffersTrainingByOrgType,
        NoTrainingReasonsByTrainingOffer,
        TrainingParticipationByTrainingOffer,
        OrganizationalPracticesByOrgType,
      ]}
      onExplore={onExplore}
      dataExtractor={dataExtractor}
      comparisonStrategy={yesNoNotSureComparisonStrategy}
    />
  );
};

export default OrganizationOffersTraining;
