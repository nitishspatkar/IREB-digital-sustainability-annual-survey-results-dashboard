import { GenericChart } from '../../../components/GraphViews';
import type { ChartProcessor, DataExtractor } from '../../../components/GraphViews';
import { OrganizationDepartmentCoordinationByAge } from '../../explore-graphs/OrganizationDepartmentCoordinationByAge.tsx';
import { OrganizationDepartmentCoordinationByRole } from '../../explore-graphs/OrganizationDepartmentCoordinationByRole.tsx';
import { OrganizationDepartmentCoordinationByOrgType } from '../../explore-graphs/OrganizationDepartmentCoordinationByOrgType.tsx';
import OrganizationMeasures from '../../explore-graphs/OrganizationMeasures.tsx';
import {
  yesNoNotSureComparisonStrategy,
  type YesNoNotSureData,
} from '../../../components/comparision-components/YesNoNotSureComparisonStrategy';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

// Data Extractor: Extracts Yes/No/Not Sure counts
const dataExtractor: DataExtractor<YesNoNotSureData> = (responses) => {
  const filteredResponses = responses.filter(
    (r) =>
      normalize(r.raw.organizationIncorporatesSustainablePractices ?? '').toLowerCase() === 'yes'
  );

  let yesCount = 0;
  let noCount = 0;
  let notSureCount = 0;

  filteredResponses.forEach((r) => {
    const raw = normalize(r.raw.organizationDepartmentCoordination ?? '');
    const lower = raw.toLowerCase();

    if (lower === 'yes') {
      yesCount++;
    } else if (lower === 'no') {
      noCount++;
    } else if (lower === 'not sure') {
      notSureCount++;
    }
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
      totalEligible: filteredResponses.length,
    },
  };
};

// The Logic (Pure Function)
// Precondition: Q17 = Yes (organizationIncorporatesSustainablePractices)
const processData: ChartProcessor = (responses, palette) => {
  const data = dataExtractor(responses);

  const labels = ['Yes', 'No', 'Not sure'];
  const values = [data.counts.yes, data.counts.no, data.counts.notSure];

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
    stats: data.stats,
  };
};

// The Component
const OrganizationDepartmentCoordination = ({ onExplore }: { onExplore?: () => void }) => {
  return (
    <GenericChart
      graphId="OrganizationDepartmentCoordination"
      processor={processData}
      layout={{
        margin: { t: 50, r: 20, b: 60, l: 48 },
        yaxis: { title: { text: 'Number of Respondents' } },
      }}
      exploreComponents={[
        OrganizationMeasures,
        OrganizationDepartmentCoordinationByAge,
        OrganizationDepartmentCoordinationByRole,
        OrganizationDepartmentCoordinationByOrgType,
      ]}
      onExplore={onExplore}
      dataExtractor={dataExtractor}
      comparisonStrategy={yesNoNotSureComparisonStrategy}
    />
  );
};

export default OrganizationDepartmentCoordination;
