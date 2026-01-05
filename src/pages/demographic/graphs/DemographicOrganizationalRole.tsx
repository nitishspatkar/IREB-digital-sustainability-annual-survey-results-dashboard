import { GenericChart } from '../../../components/GraphViews';
import type { ChartProcessor } from '../../../components/GraphViews';
import { DemographicOrganizationalRoleOther } from '../../explore-graphs/DemographicOrganizationalRoleOther';
import { DefinitionAwarenessByRole } from '../../explore-graphs/DefinitionAwarenessByRole.tsx';
import { DiscussionFrequencyByRole } from '../../explore-graphs/DiscussionFrequencyByRole.tsx';

const normalizeRole = (value: string) => value.replace(/\s+/g, ' ').trim();

const processData: ChartProcessor = (responses, palette) => {
  const counts = new Map<string, number>();

  responses.forEach((response) => {
    const role = normalizeRole(response.raw.role ?? '');
    if (role.length > 0 && role.toLowerCase() !== 'n/a') {
      counts.set(role, (counts.get(role) ?? 0) + 1);
    }
  });

  const roleStats = Array.from(counts.entries())
    .map(([role, count]) => ({ role, count }))
    .sort((a, b) => a.count - b.count);

  const numberOfResponses = roleStats.reduce((sum, stat) => sum + stat.count, 0);

  return {
    traces: [
      {
        x: roleStats.map((item) => item.count),
        y: roleStats.map((item) => item.role),
        type: 'bar',
        orientation: 'h',
        marker: { color: palette.berry },
        text: roleStats.map((item) => item.count.toString()),
        textposition: 'outside',
        textfont: { family: 'PP Mori, sans-serif', size: 12, color: palette.grey },
        cliponaxis: false,
        hoverinfo: 'none',
      },
    ],
    stats: {
      numberOfResponses,
    },
  };
};

export const DemographicOrganizationalRole = ({ onExplore }: { onExplore?: () => void }) => {
  return (
    <GenericChart
      graphId="DemographicOrganizationalRole"
      processor={processData}
      layout={{
        margin: { t: 50, r: 40, b: 40, l: 200 },
        xaxis: {
          title: {
            text: 'Number of Respondents',
          },
        },
        yaxis: {
          automargin: true,
          ticks: 'outside',
          ticklen: 10,
          tickcolor: 'rgba(0,0,0,0)',
        },
      }}
      exploreComponents={[
        DemographicOrganizationalRoleOther,
        DefinitionAwarenessByRole,
        DiscussionFrequencyByRole,
      ]}
      onExplore={onExplore}
    />
  );
};

export default DemographicOrganizationalRole;
